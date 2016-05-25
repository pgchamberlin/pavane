# Pavane

_NOTE: This is work in progress. This software is >50% good intentions at the moment._

A small script which tracks the scroll position of nodes and fires events accordingly. The idea is that you register an DOM node with Pavane, and then Pavane will call back / resolve for various things that happen with regard to that node's scroll position.

To start with the events I've (very basically) implemented are:

 - Entering the viewport
 - Leaving the viewport
 - Being wholly within the viewport
 - Being wholly outside the viewport

For each of these events Pavane will provide information such as the current scroll direction.

Check out the [crude demo](https://peterchamberlin.com/experiments/pavane/demo.html).

### Plans

I hope I'll get a chance to do some more work on this. Development I've got in mind:

 - [ ] Make it a usable library not just a hacky script
 - [ ] Rewrite in ES6 with transpilation from Babel
 - [ ] Unit tests
 - [ ] Promises
 - [ ] Additional / custom events (i.e. you might want something to fire when 500px outside viewport)

