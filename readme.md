# 99Tech Code Challenge #1 #

Note that if you fork this repository, your responses may be publicly linked to this repo.  
Please submit your application along with the solutions attached or linked.   

It is important that you minimally attempt the problems, even if you do not arrive at a working solution.

## Submission ##
You can either provide a link to an online repository, attach the solution in your application, or whichever method you prefer.
We're cool as long as we can view your solution without any pain.

---

## A note from me

Thanks for taking the time to go through this. Here's a quick walkthrough
of what I did for each problem, so you don't have to dig through the code
cold:

- **[Problem 1](src/problem1/README.md)** — I implemented the sum-to-n
  three ways (formula, loop, recursion) in plain JavaScript and noted
  the complexity of each. Just Node, nothing to install.
- **[Problem 2](src/problem2/README.md)** — for the "Fancy Form" swap UI,
  I went beyond a static layout and built a working Vite + React +
  TypeScript app that pulls live prices from the given API and actually
  performs the swap flow with validation, not just a mockup.
- **[Problem 3](src/problem3/README.md)** — I reviewed the messy React
  component and wrote up 15 separate issues I found, ranging from a
  straight-up crash to a couple of sneaky bugs hiding behind incorrect
  types. Then I fixed all of it and backed the fixes with tests, so it's
  not just my word that it works now.
- **[Problem 4](src/problem4/README.md)** — the same sum-to-n exercise
  as Problem 1, but in TypeScript this time, with the complexity
  write-up the brief asked for and a proper test suite instead of me
  just eyeballing the output.
- **[Problem 5](src/problem5/README.md)** — I built the CRUD backend
  with Express, TypeScript, and PostgreSQL through TypeORM, for a
  Product resource — create, list with filters, get, update, delete —
  with the schema managed through a real migration rather than
  auto-sync magic.
- **[Problem 6](src/problem6/README.md)** — this one's just a design
  doc, no code. I wrote a spec for a live-updating scoreboard module,
  including how I'd stop people from gaming their score, and a diagram
  walking through the request flow.

Problems 2 through 5 are each their own npm package, so you'll need to
install into each one separately:

```bash
cd src/problem2 && npm install && npm test
cd src/problem3 && npm install && npm test
cd src/problem4 && npm install && npm test
cd src/problem5 && npm install && npm test
```

