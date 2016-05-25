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

### The `optimise` flag

The way Pavane works is that every time there is a scroll event the code calls `requestAnimationFrame(update)` if there isn't an animation frame request already pending. So `update()` is running on every animation frame when there is scrolling.

`update()` by default is crude. It iterates over all the registered nodes and checks whether their state has changed (i.e. they have entered / left the viewport).

The thing is, the user is scrolling in one or other direction. So why do we check all the nodes, not just the ones that are in the direction of the scroll? Good question.

What the `optimise` flag enables is a node update strategy which does some (possibly) more efficient things:

 - When a nodes are registered they inserted in order of their `scrollY` property which means the nodes are stored in the order they appear down the page.
 - When a update happens a binary search is carried out on the list of nodes, searching for the node just outside the viewport in the opposite direction to the scroll.
 - This node is used as a slice point. The nodes are sliced at that point and the nodes in the opposite direction to the scroll are discarded.
 - Only the nodes in the direction of scroll are monitored for state changes.

This roughly halves the number of times you have to ask a node where it is in the DOM (i.e. by calling `getBoundingClientRect()`), but the search and associated code is an overhead. That might actually be more costly. I don't know yet.
 
#### Limitations

There are some limitations caused by this optimisation strategy. The main one is that Pavane won't be useful for tracking nodes which are moved around in the DOM because it expects the nodes to stay in the same vertical order. I'm not sure if that's a big deal or not. You could get around it by having a way of re-registering nodes when they are moved.

#### Further optimisations

There are some other things that can be done following this same optimisation strategy that would reduce the number of nodes to inspect. The main one I can think of is:

 - [ ] Stop inspecting node state after the first node outside the viewport in the direction of scroll

I'll do that soon and see how it changes things :-)

### The `monitor` flag

As mentioned above the `optimise` flag _might_ make things more efficient. One of the interesting things to know if you want to measure it's efficiency is how many nodes are getting inspected each time the `update()` method gets fired. The `monitor` flag causes information about the nodes inspected on `update` to get pushed into the `nodesMonitor` object, so you can inspect that and find out.

`nodesMonitor` is a global in the script so you can manipulate it in the console.
