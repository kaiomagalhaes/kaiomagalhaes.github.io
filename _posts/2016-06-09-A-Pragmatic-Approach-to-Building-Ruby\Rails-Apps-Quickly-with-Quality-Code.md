This post appeared first [here](http://www.codelitt.com/blog/pragmatic-approach-building-ruby-rails-apps-quickly-quality-code/)

Startups often place priority with speed over nearly everything. They move at astronomical speed so they can hurry into the market for proper validation. Startups product code bases or features usually fall into two categories because of this:

**In production/maintain it or under active development**

At the early stages of a product, you're very rarely taking care of tech debt. What works is running with as little maintanence (hopefully) as possible and the majority of efforts are focused on new parts of the product. 

The problem with this, of course, is the quality of the project in general mostly when it comes to code quality and security.

The founder of [LinkedIn](www.linkedin.com) [Reid Hoffman](https://www.linkedin.com/in/reidhoffman) is often quoted as saying:

*If you are not embarrassed by the first version of your product, you’ve launched too late.*

(More about this philosophy [here](http://www.businessinsider.com/the-iterate-fast-and-release-often-philosophy-of-entrepreneurship-2009-11))

Sometimes, this quote is taken a little too literally. If you're delivering on your promise then it's okay to be embarrassed about the current state of your product, but you don't necessarily have to be as embarrassed by your code quality. It is obvious that corners will be cut and tech debt will accrue for the sake of speed to market, but there are small practices that *can* ensure maintainability, elegance, and actually save time (our most expensive resource) and money so you can focus on new features. 

Here at [Codelitt Incubator](codelitt.com) we have a lot of projects built with Ruby/Rails somewhere in the stack. This sums up our reasoning [here](https://www.quora.com/Why-do-so-many-startups-use-Ruby-on-Rails). Whether its our R&D work with large companies to our startup work, we're constantly working on early stage products. Because of this, we've defined a set of gems that should be in every project in order to help us to maintain our best practices, eliminate headaches later on, and still move fast. 

### Code quality

Just saying quality is rather abstract, so we’ve decided to focus in three main points:

 1. Readability
 2. Organization
 3. Maintainability

Our code must be **readable** so our engineers don’t waste time trying to understand what it does.

Our code must be well **organized** in packages/modules/classes. We strive to follow the rules of the [Rails Style Guide](http://guides.rubyonrails.org/index.html).

Our code must be **maintainable**. Although we work with early stage products, we do care about the future of each one. We would bite ourselves in the ass because most products grow and evolve. You'll finish feature 10 and circle back to improve the first feature you built. 

##### [Rubocop](https://github.com/bbatsov/rubocop)

RuboCop is a Ruby static code analyzer, it searches for code smell and bad practices as defined by the community.
Examples of smells are:

 1. Method too complex
 2. Line too long
 3. Wrong spacing between lines or variables

The gem has a huge range of best practices and allows us to customize them, like in the example below:

```
Rails:
 Enabled: true

Metrics/LineLength:
 Max: 120

Style/Documentation:
 Enabled: false

Style/BlockDelimiters:
 Enabled: false
```

Besides showing the code smell, it offers a great auto fix system that when used with Rails will update the code changing something like: 

```ruby
def my_attribute
 my_attribute
end
```

into

``` ruby
 attr_accessor :my_attribute
```

I started using it with huge, legacy project that was already in production. It's auto fix took the code base from 1400 warnings to 214. It fixed more than 80% of the code smell. Most of the skipped problems were too complex that I had to correct, but it gives me an automated way to keep track of all of the issues I need to take care of. When ran from the beginning of a project, it is easy to quickly fix issues along the way. 

Alongside with [Rubocop](https://github.com/bbatsov/rubocop) we use [Rubocop Rspec](https://github.com/nevir/rubocop-rspec) because it has a lot of RSpec specific best practices.

These act as a watchdog for us. Even engineers with years of experience make small mistakes like the wrong use of indentation, commas, variables declared but not used, etc... We have a policy of 0 warnings in our CI, so before the build rubocop runs and if a warning is raised the build fails. We always know what to expect when jumping into another teammates projects and a lot of the younger guys have learned a lot from it. 

##### [Rubycritic](https://github.com/whitesmith/rubycritic)

Rubycritic is another static code analyzer, it wraps around the static analysis gems [Reek](https://github.com/troessner/reek), [Flay](https://github.com/seattlerb/flay) and [Flog](https://github.com/seattlerb/flog). We mainly use this gem because it offers an overview of the duplicated code and complexity, as you can see in the report below:

{<1>}![alt text](/blog/content/images/2016/05/5227312822353920.png)

We care a lot about the [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) principle and the report that this gem offers is really helpful to make sure we're not over complicating things or duplicating functionality throughout the code base.

### Security

We work with projects from ML to robotics to static splash pages to money transfer systems, but regardless security is important in all of them.

Besides our [server best practices](https://github.com/codelittinc/incubator-resources/blob/master/best_practices/servers.md) and data storage best practices, another possibly entry point is the harm that may be done to our applications by attacks with: DDOS, SQL Injection and so on. While I in NO WAY recommend these be your only security review (just as the above gems should not be soley responsible for your code quality) we use the following gems to sniff out the obvious stuff:

###### [Brakeman](https://github.com/presidentbeef/brakeman)

Brakeman is a gem that checks Ruby on Rails applications for security vulnerabilities, it raises warnings for each one that is found.

The policy for us is 0 security warnings. As it is the first step in our build process, if it finds any glaring security gap then it fails and won’t continue to build. 

###### [Dawnscanner](https://github.com/thesp0nge/dawnscanner)

Dawnscanner is a source code scanner designed to review ruby code for security issues. We use it alongside [Brakeman](https://github.com/presidentbeef/brakeman) to ensure a redundancy in the automated portion of our security review. It runs after [Brakeman](https://github.com/presidentbeef/brakeman) and fails if it finds any gap as well.

###### [Bundler-audit](https://github.com/rubysec/bundler-audit)

Bundler Audit checks the Gemfile.lock and searches for security issues that have been reported in each gem used in the project. If it finds any problem in the version of a gem, it searches for a patch level that is secure and asks us to update it. If a secure one doesn’t exist, well, it is time to search for another gem completely. 

While we focus on the general security of our applications it is common to forget that the product is a combination of gems, libraries, and code that we write, so if any gem used in the project has a security gap then it is a trojan horse that can sink our best code. 

[Bundler-audit](https://github.com/rubysec/bundler-audit) is the third step before the build. When it finds a compromised gem, we search for a safe version, in the case of not finding one, we just throw it away and search for another way to solve the problem.

#### Test coverage

Test coverage is important because with this data we can ensure that our application is being minimally tested. As code lines covered doesn't guarantee that the critical points of the application are being tested (which should be our main focus), we can’t use it as basis to make sure that our applications are entirely tested and set, but these gems provide a fairly decent overview that usually can identify weak points. Tests save us a huge amount of QA if only because we know something that was working will keep working after some change in the code.

##### [Simplecov](https://github.com/colszowka/simplecov)

SimpleCov is a code coverage analysis tool for Ruby. Besides offering good test reports, it allows us to configure our tests to fail if a specified coverage percentage is not met.

We define that the minimum code coverage should be at least 90%.

### Summary

These are the principles and gems that we use in our Ruby/Rails projects here at [Codelitt](codelitt.com). It will be updated every time that we find new gems or good practices. Again, these do not replace proper code reviews, pen testing, refactoring, etc, (we'll cover that in a future article) but they do provide an automated way for you to move fast and have a certain level of confidence in your code. If you know a better solution or have some recommendation please let me know in the comments or by email. I would really appreciate it: kaio@codelitt.com.

If you want to know more about our best practices, take a look in our [repository](https://github.com/codelittinc/incubator-resources). We open source all of our policies and best practices as well as continue to add to them there. 
