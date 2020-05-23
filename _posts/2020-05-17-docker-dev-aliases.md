---
layout:     post
title:      Docker Dev Aliases
author:		Lukasz Ciesluk
permalink:  /docker-dev-aliases/
tags:		docker
---

It's very frustrating for me when I need to provide, especially during development time, the same commands over and over. It's getting even worst once the command has many arguments attached!

Of course, I am trying to reuse bash search history in the shell via `Ctrl+R` as much as I can, but I struggle the most when your history is not populated with the command I am looking for.

That's why I have defined a few Docker aliases in `.bashrc` which allow me to speed up my development time and overall satisfaction as well!

{% highlight shell %}
alias dps='docker ps -a'
alias dimg='docker images'

alias dev='docker events'
alias dlgs='docker logs $1'
alias dlgsf='docker logs $1 -f'
alias dins='docker inspect $1'
alias dh='docker history $1'

alias dex="docker exec -ti $1 /bin/sh"

alias drm='docker rm $1'
alias drmi='docker rmi $1'

alias dstart='docker start $1'
alias dstop='docker stop $1'
alias dstopall="docker ps -q | awk '{print $1}' | xargs -o docker stop"

alias dcb='docker-compose build'
alias dcu='docker-compose up'

alias dcs="docker-compose stop"
alias dcd="docker-compose down"
alias dcr="docker-compose restart"

alias dclogs='docker-compose logs'
{% endhighlight %}

I just would like to make a note about alias named as `dex` which will launch a Bourne shell within a container. It has defined `/bin/sh` as a shell (default shell enforced by `ENTRYPOINT`), but you should change it when your containers are using another shell like `/bin/bash`. It depends on how your `Dockerfile` is structured around the usage of `CMD` and/or `ENTRYPOINT`.

To make these aliases available for usage you might do two things
* logout and login once again / restart the computer

OR

* run `source ~/.bashrc` in terminal to take effect immediately