---
layout: post
title: TestCaseSource - Flexible inputs for your tests
author: Lukasz Ciesluk
permalink: "/testcasesource-flexible-inputs-for-your-tests/"
tags: [testing]
description: "Using NUnit's TestCaseSource attribute for parameterized tests with complex objects like IGrouping instead of simple TestCase annotations."
---

As part of the development cycle, I worked on unit tests for a new module. To streamline the process, Usually I use NUnit’s **TestCase** annotation, which allows defining multiple input parameters and expected outcomes in one test method. This made it easy to cover a wide range of scenarios while keeping the tests concise and maintainable. Example below how this annotation is used for testing.

{% highlight csharp %}
[TestCase(1, 2, 3)]
[TestCase(-1, -2, -3)]
[TestCase(0, 0, 0)]
public int CalculatorAdd(int a, int b, int expected)
{
    // Arrange
    var calculator = new Calculator();

    // Act
    var result = calculator.Add(a, b);

    // Assert
    Assert.That(result, Is.EqualTo(expected));
}
{% endhighlight %}

However, my situation turned out to be a bit different, since I needed to supply a List of objects as input. Unfortunately, using the annotation as shown above led to the following error.

> An attribute argument must be a constant expression, typeof expression or array creation expression of an attribute parameter type

While troubleshooting the limitation with the [TestCase] annotation, I discovered another option in NUnit called [TestCaseSource]. This attribute offered the flexibility needed to shape input parameters as required by my test methods. With [TestCaseSource], I could easily pass types such as complex lists or custom groupings.

When testing a method like **Calculate** that expects an input for example of **IGrouping<string, CustomObject>**, [TestCaseSource] allows you to specify a static method that produces tailored test data for these cases.

{% highlight csharp %}
[Test]
[TestCaseSource(nameof(GetCalculateTestCases))]
public void Calculate(TestGrouping testGrouping, double? expected)
{
    Module.Calculate(testGrouping).Should().Be(expected);
}

private static IEnumerable<TestCaseData> GetCalculateTestCases()
{
    yield return new TestCaseData(
        new TestGrouping("ID1", new[]
        {
            new CustomObject { Value = 100 },
            new CustomObject { Value = 150 }
        }),
        250
    );

    yield return new TestCaseData(
        new TestGrouping("ID1", new[]
        {
            new CustomObject { Value = 100 },
            new CustomObject { Value = 0 }
        }),
        100
    );

    yield return new TestCaseData(
        new TestGrouping("ID1", new[]
        {
            new CustomObject { Value = 0 },
            new CustomObject { Value = 0 }
        }),
        0
    );
}

public class TestGrouping(string key, IEnumerable<CustomObject> items) : IGrouping<string, CustomObject>
{
    public string Key { get; } = key;
    public IEnumerator<CustomObject> ItemsEnumerator { get; } = items.GetEnumerator();
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => items.GetEnumerator();

}
{% endhighlight %}

The [Test] attribute is required when using the [TestCase] attribute, but when using [TestCaseSource], it's optional, and you can omit the [Test] attribute if desired.

In the example above, the **Should()** assertion is available thanks to the [Fluent Assertions](https://fluentassertions.com/) library, which enhances test readability and expressiveness by providing a fluent syntax for checks.

[TestCaseSource](https://docs.nunit.org/articles/nunit/writing-tests/attributes/testcasesource.html)