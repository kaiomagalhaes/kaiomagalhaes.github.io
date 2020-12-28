---
layout: page
title: The importance of a design system when building products
---

A few weeks ago while interviewing a developer for a position at Codelitt, he only had one question for me "Would I be the one creating the design?" As we were on a call he may have thought that my video froze, because it took me a while to realize that he was serious about it. I kept wondering myself "Why would a developer ask that?" After I came out of the shock, my answer was a simple one "Of course not, we are not savages here." He laughed, I laughed, but after the interview was over I couldn't stop thinking about it. While trying to understand it,  I had flashbacks of similar situations I've seen in the past.
Not so long ago, I had a friend that was starting a marketing agency, and she needed a developer. Being the closest reference to the market she reached out to me for guidance about how to hire a software engineer. Aware that she didn't have any experience with web development, I asked about her plans for the team. At the time I assumed that when it comes to web development it is natural to expect a designer on the team. I couldn't have been more wrong. When we started discussing the team, and I brought the point about the designer, her answer was
"If the engineer is good he will bring the designer with him or design himself." - A friend of mine
After I explained how it isn't like that to her, we agreed to disagree. Needless to say, her agency never kicked off.
By the end of the meeting with the candidate, although I was happy with the fact that nowadays I always have a design by my side, I still wanted an answer to the question
Is a designer in my team enough to guarantee a nice looking output and a maintainable stylesheet?
After some careful consideration, and comparing situations across projects I came to the conclusion that no, having a design in my team isn't enough. The reason is simple, just adding a specialist to a team doesn't solve any problem if there is no process behind that. Let me give you an example:
Reviewing one of our oldest projects I came across this jewel. Below you have the colors.sass file

As you may notice, we have quite a few tons of blue, where did the blue3, blue4, and blue5 go?, I don't know. This situation is a good example of what happens when we leave a set of engineers to name colors. This image above is an excerpt from a file that contains 44 different tons. In this scenario, we always had a designer working together with the engineering team. A possible reason that drove to this situation was that we changed the engineers quite often. On top of this constant change in staff, we also didn't have a design system for new ones to follow.
When it comes to building pages, there is a lot that engineering can copy from the design system. Color naming is the most obvious, but the same principle applies to componentization. By having the design system we can develop our components with a clear reusability goal. Below, for instance, the first two below are on our website while the third one is on our blog.



And we can even build the variations together at the beginning of the project

In the past, for instance, we had this on one of our projects. In that situation, we didn't have an idea of how many options we would see for buttons. We also didn't have a clear picture about how we would reuse them. In the end the engineers had to make decisions about the type of buttons, and how they would behave in a specific rather than a generic way.

Opposed to that, with a design system we can, in the beginning of the project, define a good reusability base for the key components.

Having a design system we can guide our engineers better, direct our efforts in speed in the long run. After we build the basic components, more often than not we will end up reusing them rather than creating one for each specific case. This way we can focus on building features that the users will love all across the board without having to remake each one from scratch.