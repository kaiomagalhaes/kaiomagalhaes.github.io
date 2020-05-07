---
title: The importance of a design system for the engineering team
subtitle: Why is a design sistem important for an engineering team
---

During one of my recent job interviews with a frontend engineer he asked me "Will I be responsible for designing the application as well?". My first reaction was shock, "Why on earth would I ask an engineer to design an application?", but this thought was soon replaced with "I too have designed applications a long time ago". Asking an engineer to design an application is the equivalent of placing a camel on a horse race. The camel can definitely run, but you would rather regret betting on it as the winner, and will possibly end up disappointed with your underperforming camel. The moment I could find my words I explained to him that we always have a designer working alongside with the developer to guarantee the look and feel of the application.

Although I would love to say that my answer was the final solution for the problem of having an engineer being responsible for design, it actually only hides another level of problem. When it comes to paying for software, it is more expensive to maintain an artifact than to build it the first time. Which doesn't make it cheaper to build at first, just worse to maintain. With that said, there are measures that can be taken to improve the maintainability and extensibility of a frontend piece. 

One big issue I've faced in the past was the lack of a proper design planning. The story would go like this:

1. I would see a design for a page, and I wouldn't have an idea of any other page
2. I would build let's say, a button for that page
3. Later I would see another page, and discover that there is one more variation of that button
4. I would go to my old button and update it to allow for the new variation
5. Repeat step 3 and 4 a dozen times

Now imagine these steps happening from different components of a page, with: cards, headers, avatars, menus and the list goes on and on. I remember vividly one developer telling me:

> If I knew how many things would be different across these cards, I would have built a generic one from the beginning, but instead I always assumed we wouldn't have a new variation, it is 2 am and here I am creating another one

Another problem easy to ignore is color naming. If naming wasn't important, the human race wouldn't have created a name for every single thing in the universe. Nowadays if it exists it has a name. Now imagine what happens when someone who doesn't have a clue about colors, is responsible for naming those. It is the same as asking a painter to name a new species of spider in Latin. 

For instance, this happened:

![Messy SASS colors example](https://raw.githubusercontent.com/kaiomagalhaes/kaiomagalhaes.github.io/master/_posts/images/design-system-1.png)


This is a good example of what happens when an engineer is responsible for naming colors. 

You can check the full file [here](https://gist.github.com/kaiomagalhaes/0f0043451ca3b4afb5c6065fa0fd3ada)

And last but not least, grids. When it comes to placing components in the screen we always need to think about multiple screen sizes, and this is where shit hits the fan. We rarely can have two developers building a navbar with the same dimensions for desktop and mobile without giving them instructions about in which proportion it should decrease/increase the size. For instance:

![Header example 1](https://raw.githubusercontent.com/kaiomagalhaes/kaiomagalhaes.github.io/master/_posts/images/design-system-2.png)
![Header example 2](https://raw.githubusercontent.com/kaiomagalhaes/kaiomagalhaes.github.io/master/_posts/images/design-system-3.png)