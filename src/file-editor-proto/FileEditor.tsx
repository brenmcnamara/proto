import './FileEditor.css';

import * as React from 'react';

export interface Props {}

export default class FileEditor extends React.Component<Props> {
  public render() {
    return (
      <div className="FileEditor">
        <h1>Building a Visual Language</h1>
        <p>
          Working in software development and design, we are often required to
          ship one-off solutions. Sometimes we’re working within time
          constraints and sometimes we just haven’t yet agreed upon a path
          forward. These one-off solutions aren’t inherently bad, but if they
          aren’t built upon a solid foundation, we eventually find ourselves
          having to pay back accrued technical and design debts.
        </p>
        <p>
          Visual language is like any other language. Misunderstandings arise if
          the language is not shared and understood by everyone using it. As a
          product or team grows, the challenges within these modalities
          compound.
        </p>
        <p>
          Design has always been largely about systems, and how to create
          products in a scalable and repeatable way. From Pantone colors to
          Philips screws, these systems enable us to manage the chaos and create
          better products. Digital products are perhaps the most fertile ground
          for implementing these systems and yet it’s not often considered a
          priority.
        </p>
        <p>
          A unified design system is essential to building better and faster;
          better because a cohesive experience is more easily understood by our
          users, and faster because it gives us a common language to work with.
        </p>
        <h2>Why we need design systems</h2>
        <p>
          Airbnb has experienced a lot of growth over the years. Currently our
          design department consists of nearly a dozen functions and outcome
          teams. It became clear that we needed more systematic ways to guide
          and leverage our collective efforts. While we recognized these
          challenges within the company, I believe they are symptoms of larger
          software industry problems.
        </p>
        <h3>Too Few Constraints</h3>
        <p>
          Software design has few physical constraints compared to many other
          design disciplines. This allows for a variety of solutions to any
          given challenge, but also opens it to disjointed user experiences. As
          product owners and designers, we have to create and follow our own
          constraints.
        </p>
        <h3>Multiple Designers and Stakeholders</h3>
        <p>
          Software is often built by teams– sometimes incredibly large teams– of
          people. The challenge to create coherent experiences multiplies
          exponentially as more people are added to the mix. Also over time, no
          matter how consistent or small a team is, different people will
          contribute new solutions and styles, causing experiences to diverge.
        </p>
      </div>
    );
  }
}
