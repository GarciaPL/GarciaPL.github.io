// Password form + decryption + whole-family chart (d3 + dagre) for /family/.
// Decryption parameters must match _family/encrypt.rb.
(function () {
  var form = document.getElementById('family-login');
  var input = document.getElementById('family-password');
  var error = document.getElementById('family-error');
  var button = form.querySelector('button');
  var payloadPromise = fetch(form.getAttribute('data-src'), { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('Could not load family data');
    return r.json();
  });

  function fromBase64(s) {
    return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); });
  }

  function deriveKey(password, payload) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: fromBase64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      });
  }

  function decrypt(key, payload) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(payload.iv) }, key, fromBase64(payload.data))
      .then(function (plain) { return JSON.parse(new TextDecoder().decode(plain)); });
  }

  var CARD_W = 150, CARD_H = 84, COUPLE_GAP = 52, NODE_SEP = 40, RANK_SEP = 80, MARGIN = 30;

  // Groups partners (spouses or co-parents) into one row unit, so dagre keeps them side by side
  function buildUnits(people, byId) {
    var partners = {};
    people.forEach(function (p) { partners[p.id] = p.rels.spouses.slice(); });
    people.forEach(function (p) {
      var ps = p.rels.parents;
      if (ps.length === 2 && partners[ps[0]].indexOf(ps[1]) < 0) {
        partners[ps[0]].push(ps[1]);
        partners[ps[1]].push(ps[0]);
      }
    });

    var unitOf = {}, units = [];
    people.forEach(function (p) {
      if (p.id in unitOf) return;
      var members = [], stack = [p.id];
      while (stack.length) {
        var id = stack.pop();
        if (id in unitOf) continue;
        unitOf[id] = units.length;
        members.push(byId[id]);
        stack = stack.concat(partners[id]);
      }
      // Person with most partners in the middle, partners alternating either side; men left in a couple
      members.sort(function (a, b) {
        return partners[b.id].length - partners[a.id].length || (a.data.gender === 'M' ? -1 : 1);
      });
      var row = [members[0]];
      members.slice(1).forEach(function (m, i) { i % 2 ? row.unshift(m) : row.push(m); });
      if (row.length === 2 && row[0].data.gender === 'F' && row[1].data.gender === 'M') row.reverse();
      units.push(row);
    });
    return { units: units, unitOf: unitOf, partners: partners };
  }

  function layout(people) {
    var byId = {};
    people.forEach(function (p) { byId[p.id] = p; });
    var built = buildUnits(people, byId);

    var g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: NODE_SEP, ranksep: RANK_SEP, marginx: MARGIN, marginy: MARGIN });
    g.setDefaultEdgeLabel(function () { return {}; });
    built.units.forEach(function (row, i) {
      g.setNode('u' + i, { width: row.length * CARD_W + (row.length - 1) * COUPLE_GAP, height: CARD_H });
    });
    people.forEach(function (p) {
      p.rels.parents.forEach(function (parent) {
        var from = 'u' + built.unitOf[parent], to = 'u' + built.unitOf[p.id];
        if (from !== to) g.setEdge(from, to);
      });
    });
    // dagre decides the generation rows and a first left-to-right order
    dagre.layout(g);
    var units = built.units.map(function (row, i) {
      var n = g.node('u' + i);
      return { row: row, x: n.x, y: n.y, width: n.width };
    });
    function unitOf(id) { return units[built.unitOf[id]]; }

    // Put each partner on the side of their own parents, so parent lines don't cross
    // (someone without parents in the tree counts as being in the middle of their row)
    function parentsX(p) {
      var xs = p.rels.parents.map(function (id) { return unitOf(id).x; });
      if (!xs.length) return unitOf(p.id).x;
      return xs.reduce(function (a, b) { return a + b; }) / xs.length;
    }

    // Card centre relative to its row unit's centre
    function cardOffset(id) {
      var u = unitOf(id);
      return -u.width / 2 + u.row.indexOf(byId[id]) * (CARD_W + COUPLE_GAP) + CARD_W / 2;
    }
    // Where a family's line starts: between both parents if they're partners in one row, else under the parent
    function originOffset(parents) {
      if (parents.length === 2 && unitOf(parents[0]) === unitOf(parents[1])) {
        return (cardOffset(parents[0]) + cardOffset(parents[1])) / 2;
      }
      return cardOffset(parents[0]);
    }

    // Each unit wants to sit under its parents and above its children
    function relink() {
      units.forEach(function (u) {
        if (u.row.length === 2 && parentsX(u.row[0]) > parentsX(u.row[1])) u.row.reverse();
        u.links = [];
      });
      people.forEach(function (p) {
        if (!p.rels.parents.length) return;
        var parent = unitOf(p.rels.parents[0]), child = unitOf(p.id);
        if (parent === child) return;
        var shift = originOffset(p.rels.parents) - cardOffset(p.id);
        child.links.push({ unit: parent, shift: shift });
        parent.links.push({ unit: child, shift: -shift });
      });
    }

    // Rows top to bottom, each sorted left to right
    var rows = {};
    units.forEach(function (u) { (rows[u.y] = rows[u.y] || []).push(u); });
    rows = Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).map(function (y) {
      return rows[y].sort(function (a, b) { return a.x - b.x; });
    });

    // Move each unit towards where its relatives are, without overlapping or reordering others.
    // The best positions for one row are an isotonic regression (pool adjacent violators).
    function placeRow(row) {
      var want = row.map(function (u) {
        if (!u.links.length) return u.x;
        return u.links.reduce(function (s, l) { return s + l.unit.x + l.shift; }, 0) / u.links.length;
      });
      // Re-order by where units want to be, which removes most line crossings
      var order = row.map(function (u, i) { return i; }).sort(function (a, b) { return want[a] - want[b] || a - b; });
      var sorted = order.map(function (i) { return row[i]; });
      var offset = 0, blocks = [];
      sorted.forEach(function (u, i) {
        if (i) offset += (sorted[i - 1].width + u.width) / 2 + NODE_SEP;
        u.offset = offset;
        blocks.push({ sum: want[order[i]] - offset, n: 1 });
        while (blocks.length > 1 && blocks[blocks.length - 2].sum / blocks[blocks.length - 2].n >
               blocks[blocks.length - 1].sum / blocks[blocks.length - 1].n) {
          var b = blocks.pop();
          blocks[blocks.length - 1].sum += b.sum;
          blocks[blocks.length - 1].n += b.n;
        }
      });
      var i = 0;
      blocks.forEach(function (b) {
        for (var k = 0; k < b.n; k++, i++) sorted[i].x = b.sum / b.n + sorted[i].offset;
      });
      row.splice.apply(row, [0, row.length].concat(sorted));
    }
    for (var round = 0; round < 3; round++) {
      relink();
      for (var pass = 0; pass < 8; pass++) {
        (pass % 2 ? rows.slice().reverse() : rows).forEach(placeRow);
      }
    }

    var minX = Infinity, maxX = -Infinity, maxY = 0;
    units.forEach(function (u) {
      minX = Math.min(minX, u.x - u.width / 2);
      maxX = Math.max(maxX, u.x + u.width / 2);
      maxY = Math.max(maxY, u.y + CARD_H / 2);
    });
    var pos = {};
    units.forEach(function (u) {
      var left = u.x - u.width / 2 - minX + MARGIN;
      u.row.forEach(function (p, k) {
        pos[p.id] = { x: left + k * (CARD_W + COUPLE_GAP), y: u.y - CARD_H / 2 };
      });
    });

    // Each line and label records who it connects, so a person's line can be highlighted:
    // it's part of the line when everyone in `all` and at least one in `any` (if given) is.
    var lines = [], labels = [];
    // Partner lines between neighbouring cards in a row, with the marriage year above
    built.units.forEach(function (row) {
      for (var k = 0; k < row.length - 1; k++) {
        var a = pos[row[k].id], y = a.y + CARD_H / 2, pair = [row[k].id, row[k + 1].id];
        // Drawn as two halves, one per partner, because children's lines start at the middle:
        // a half belongs to the line when its partner does and so does the other partner or a shared child
        var shared = row[k].rels.children.filter(function (id) { return row[k + 1].rels.children.indexOf(id) >= 0; });
        var left = a.x + CARD_W, mid = left + COUPLE_GAP / 2;
        lines.push({ d: 'M' + left + ',' + y + 'H' + mid, all: [pair[0]], any: [pair[1]].concat(shared) });
        lines.push({ d: 'M' + mid + ',' + y + 'H' + (left + COUPLE_GAP), all: [pair[1]], any: [pair[0]].concat(shared) });
        var married = row[k].data.married && row[k].data.married[row[k + 1].id];
        if (married) {
          // Year only, keeping "ok."/"przed"/"po": "ok. 12.06.1950" -> "ok. 1950"
          var year = married.replace(/(\d{2}\.){1,2}(?=\d{4})/, '');
          labels.push({ x: a.x + CARD_W + COUPLE_GAP / 2, y: y - 6, text: '⚭ ' + year, all: pair, any: [] });
        }
      }
    });
    // Parent -> child lines; children of the same parents share a horizontal bar
    var families = {};
    people.forEach(function (p) {
      if (!p.rels.parents.length) return;
      var key = p.rels.parents.slice().sort().join('+');
      (families[key] = families[key] || { parents: p.rels.parents, children: [] }).children.push(p.id);
    });
    var barsPerRank = {};
    Object.keys(families).forEach(function (key) {
      var f = families[key], ps = f.parents.map(function (id) { return pos[id]; });
      var ox, oy;
      if (ps.length === 2 && unitOf(f.parents[0]) === unitOf(f.parents[1])) {
        // From the middle of the partner line
        ox = (Math.min(ps[0].x, ps[1].x) + Math.max(ps[0].x, ps[1].x) + CARD_W) / 2;
        oy = ps[0].y + CARD_H / 2;
      } else {
        ox = ps[0].x + CARD_W / 2;
        oy = ps[0].y + CARD_H;
      }
      var childTop = pos[f.children[0]].y;
      // Nudge bars of different families on the same rank apart so they don't merge
      var n = barsPerRank[childTop] = (barsPerRank[childTop] || 0) + 1;
      var barY = childTop - RANK_SEP / 2 + ((n % 3) - 1) * 8;
      var only = f.children.length === 1 && pos[f.children[0]];
      if (only && ox > only.x + 10 && ox < only.x + CARD_W - 10) {
        // Single child roughly underneath: straight line instead of a tiny jog
        lines.push({ d: 'M' + ox + ',' + oy + 'V' + only.y, all: [f.children[0]], any: f.parents });
        return;
      }
      f.children.forEach(function (id) {
        var c = pos[id];
        lines.push({ d: 'M' + ox + ',' + oy + 'V' + barY + 'H' + (c.x + CARD_W / 2) + 'V' + c.y, all: [id], any: f.parents });
      });
    });

    return { pos: pos, lines: lines, labels: labels, width: maxX - minX + 2 * MARGIN, height: maxY + MARGIN };
  }

  function nameLines(name) {
    if (name.length <= 18 || name.indexOf(' ') < 0) return [name];
    var cut = name.lastIndexOf(' ', Math.ceil(name.length / 2) + 2);
    if (cut <= 0) cut = name.indexOf(' ');
    return [name.slice(0, cut), name.slice(cut + 1)];
  }

  var panel = document.getElementById('family-person');

  // "ok. 14.03.1925" -> { y: 1925, m: 3, d: 14, prefix: 'ok.' }; "?" -> null
  function parseDate(s) {
    var m = s && s.match(/^(?:(ok\.|przed|po) )?([\d.]+)$/);
    if (!m) return null;
    var parts = m[2].split('.').map(Number).reverse();
    return { y: parts[0], m: parts[1], d: parts[2], prefix: m[1] };
  }

  // 1 rok, 2-4 lata (but 12-14 lat), 22 lata, 25 lat...
  function yearsWord(n) {
    if (n === 1) return 'rok';
    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'lata' : 'lat';
  }

  // Age now, or at death (e.g. "73 lata"). "ok." when either date is approximate or lacks day/month;
  // nothing when a date is only known as "przed"/"po" or unknown.
  function age(p) {
    var dead = !!p.data.died, b = parseDate(p.data.born), now = new Date();
    var e = dead ? parseDate(p.data.died) : { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
    if (!b || !e || /przed|po/.test(b.prefix + e.prefix)) return null;
    var exact = b.m && b.d && e.m && e.d && !b.prefix && !e.prefix;
    var n = e.y - b.y;
    if (exact && (e.m < b.m || (e.m === b.m && e.d < b.d))) n--;
    if (n < 0 || (!dead && n > 110)) return null;
    if (n === 0 && exact) return 'poniżej roku';
    return (exact ? '' : 'ok. ') + n + ' ' + yearsWord(n);
  }

  function showPerson(p, people) {
    var byId = {};
    people.forEach(function (q) { byId[q.id] = q; });
    function names(ids) { return ids.map(function (id) { return byId[id].data.name; }).join(', '); }
    function datePlace(date, place) { return [date, place].filter(Boolean).join(', '); }

    var d = p.data, facts = document.getElementById('family-person-facts');
    var siblings = people.filter(function (q) {
      return q !== p && q.rels.parents.some(function (id) { return p.rels.parents.indexOf(id) >= 0; });
    });
    var married = p.rels.spouses.map(function (id) {
      return byId[id].data.name + (d.married && d.married[id] ? ' (ślub ' + d.married[id] + ')' : '');
    });

    facts.textContent = '';
    [
      ['Nazwisko rodowe', d.maiden_name],
      ['Urodzenie', datePlace(d.born, d.birthplace)],
      ['Śmierć', datePlace(d.died, d.deathplace)],
      ['Wiek', age(p)],
      ['Pochówek', d.buried],
      ['Zawód', d.occupation],
      ['Miejsca zamieszkania', (d.lived || []).join(', ')],
      ['Małżeństwo', married.join('\n')],
      ['Rodzice', names(p.rels.parents)],
      ['Rodzeństwo', names(siblings.map(function (q) { return q.id; }))],
      ['Dzieci', names(p.rels.children)]
    ].forEach(function (fact) {
      if (!fact[1]) return;
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = fact[0];
      dd.textContent = fact[1];
      facts.appendChild(dt);
      facts.appendChild(dd);
    });
    document.getElementById('family-person-name').textContent = d.name;
    var notes = document.getElementById('family-person-notes');
    notes.textContent = d.notes || '';
    notes.hidden = !d.notes;
    panel.hidden = false;
    panel.scrollTop = 0;
  }

  function hidePerson() {
    panel.hidden = true;
    d3.select('#family-tree svg').classed('focus', false);
    d3.selectAll('.family-card').classed('selected', false);
  }

  panel.querySelector('button').addEventListener('click', hidePerson);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePerson();
  });

  function showTree(people) {
    document.getElementById('family-locked').hidden = true;
    document.getElementById('family-unlocked').hidden = false;

    var tree = layout(people);
    var cont = document.getElementById('family-tree');
    var svg = d3.select(cont).append('svg').attr('width', '100%').attr('height', '100%');
    var root = svg.append('g');

    var paths = root.append('g').attr('class', 'family-lines').selectAll('path')
      .data(tree.lines).enter().append('path').attr('d', function (l) { return l.d; });
    var marriages = root.append('g').attr('class', 'family-married').selectAll('text')
      .data(tree.labels).enter().append('text')
      .attr('x', function (l) { return l.x; }).attr('y', function (l) { return l.y; })
      .text(function (l) { return l.text; });

    var cards = root.append('g').selectAll('g').data(people).enter().append('g')
      .attr('class', function (p) { return 'family-card ' + (p.data.gender === 'F' ? 'female' : 'male'); })
      .attr('transform', function (p) { return 'translate(' + tree.pos[p.id].x + ',' + tree.pos[p.id].y + ')'; });
    cards.append('rect').attr('width', CARD_W).attr('height', CARD_H).attr('rx', 6);
    cards.each(function (p) {
      var rows = nameLines(p.data.name).map(function (t) { return { text: t }; });
      if (p.data.maiden_name) rows.push({ text: 'z d. ' + p.data.maiden_name, cls: 'maiden' });
      if (p.data.born) rows.push({ text: '* ' + p.data.born, cls: 'dates' });
      if (p.data.died) rows.push({ text: '† ' + p.data.died, cls: 'dates' });
      var text = d3.select(this).append('text').attr('x', CARD_W / 2)
        .attr('y', CARD_H / 2 - (rows.length - 1) * 7.5 + 5);
      rows.forEach(function (r, i) {
        text.append('tspan').attr('x', CARD_W / 2).attr('dy', i ? 15 : 0).attr('class', r.cls || null).text(r.text);
      });
    });

    // Tapping a card shows details and highlights the person's ancestors and descendants;
    // nobody is hidden. d3.zoom swallows the click after a drag.
    var byId = {};
    people.forEach(function (p) { byId[p.id] = p; });
    function lineage(p) {
      var set = {};
      (function up(id) { set[id] = true; byId[id].rels.parents.forEach(up); })(p.id);
      (function down(id) { set[id] = true; byId[id].rels.children.forEach(down); })(p.id);
      return set;
    }
    function inLine(set) {
      return function (l) {
        return l.all.every(function (id) { return set[id]; }) &&
          (!l.any.length || l.any.some(function (id) { return set[id]; }));
      };
    }
    cards.on('click', function (e, p) {
      e.stopPropagation();
      var set = lineage(p);
      svg.classed('focus', true);
      cards.classed('selected', function (d) { return d === p; })
        .classed('on', function (d) { return set[d.id]; });
      paths.classed('on', inLine(set));
      marriages.classed('on', inLine(set));
      showPerson(p, people);
    });
    svg.on('click', hidePerson);

    // Fit the whole tree on screen; on small screens don't shrink below readable size (drag to see the rest)
    var zoom = d3.zoom().scaleExtent([0.1, 2]).on('zoom', function (e) { root.attr('transform', e.transform); });
    svg.call(zoom).on('dblclick.zoom', null);
    var w = cont.clientWidth, h = cont.clientHeight;
    var scale = Math.max(Math.min(w / tree.width, h / tree.height, 1), w < 600 ? 0.75 : 0.4);
    var x = (w - tree.width * scale) / 2, y = Math.max((h - tree.height * scale) / 2, 0);
    svg.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    error.hidden = true;
    button.disabled = true;
    button.textContent = 'Otwieranie…';
    payloadPromise
      .then(function (payload) {
        return deriveKey(input.value, payload).then(function (key) { return decrypt(key, payload); });
      })
      .then(function (people) {
        button.disabled = false;
        button.textContent = 'Otwórz';
        // Outside the catch below, so a drawing bug shows in the console instead of as "wrong password"
        setTimeout(function () { showTree(people); });
      }, function () {
        button.disabled = false;
        button.textContent = 'Otwórz';
        error.hidden = false;
        input.select();
      });
  });
})();
