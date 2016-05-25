var nodesMonitor = { nodes: [], sum: 0, mean: 0 };
var monitor = true;
var optimise = true;

;(function() {

    /**
     * Pavane object states
     *   viewport:enter     (top|bottom) The object has partially entered the viewport
     *   viewport:leave     (top|bottom) The object has partially left the viewport
     *   viewport:within    (top|bottom) The object is wholly within the viewport
     *   viewport:outside   (top|bottom)  The object is wholly outside the viewport
     */
    var lastScrollTop;
    var scrollDirection;
    var ticking = false;
    var nodes = [];

    function bindEvents() {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
    }

    function bindPeriodic(ms) {
        if (!ms) ms = 500;
        setInterval(handleScroll, ms);
    }

    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
        }
        ticking = true;
    }

    function publishInitialState(n) {
        if (n.lastState.visible === true) {
            dispatch("enter", n);
        }

        if (n.lastState.within === true) {
            dispatch("within", n);
        }
    }

    function updateNode(n) {
        var lastState = n.lastState;
        var newState = n.lastState = getVisibility(n.node);

        if (newState.visible !== lastState.visible) {
            if (newState.visible === false) {
                dispatch("outside", n);
            } else {
                dispatch("enter", n);
            }
        }

        if (newState.within !== lastState.within) {
            if (newState.within === false) {
                dispatch("leave", n);
            } else {
                dispatch("within", n);
            }
        }
    }

    function updateScrollDirection() {
        var latestScrollTop = window.scrollY;
        scrollDirection = latestScrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = latestScrollTop;
    }

    function getSlicePoint(nodes, scrollTop, offset, jump) {
        if (jump === 1 || offset === 0) return offset;
        if (!offset) offset = Math.floor(nodes.length / 2);
        if (!jump) jump = offset;
        if (nodes[offset].initialY > scrollTop) {
            var nextOffset = offset - Math.floor(jump / 2);
        } else {
            var nextOffset = offset + Math.floor(jump / 2);
        }
        return getSlicePoint(nodes, scrollTop, nextOffset, Math.abs(offset - nextOffset));
    }

    function update() {
        var nodesToUpdate;
        ticking = false;
        if (optimise) {
            updateScrollDirection();
            var scrollTop = scrollDirection === "up" ? lastScrollTop + (window.innerHeight || document.documentElement.clientHeight) + 250: lastScrollTop - 250;
            slicePoint = getSlicePoint(nodes, scrollTop);
            nodesToUpdate = scrollDirection === "up" ? nodes.slice(0, slicePoint) : nodes.slice(slicePoint);
        } else {
            nodesToUpdate = nodes;
        }

        if (monitor === true) {
            nodesMonitor.sum += nodesToUpdate.length;
            nodesMonitor.nodes.push(nodesToUpdate.length);
            nodesMonitor.mean = Math.ceil(nodesMonitor.sum / nodesMonitor.nodes.length);
        }

        for (var i = 0; i < nodesToUpdate.length; i++) {
            if (updateNode(nodesToUpdate[i]) === false) break;
        }
    }

    function dispatch(e, n) {
        if (e in n.callbacks) {
            n.callbacks[e](e, n.node);
        }
    }

    function getVisibility(n) {
        var rect = n.getBoundingClientRect();
        var winHeight = window.innerHeight || document.documentElement.clientHeight;

        return {
            visible: rect.top >= 0 - rect.height && rect.top <= winHeight,
            within: rect.top >= 0 && rect.top + rect.height <= winHeight,
            bcRect: rect
        }
    }

    function register(n, cb) {
        var visibility = getVisibility(n);
        var callbacks = {
            enter: cb.enter || null,
            leave: cb.leave || null,
            within: cb.within || null,
            outside: cb.outside || null
        }
        var node = {
            initialY: visibility.bcRect.top + window.scrollY,
            node: n,
            callbacks: callbacks,
            lastState: getVisibility(n)
        }

        if (optimise === true && nodes.length > 0) {
            for (var i = nodes.length; i > 0; --i) {
                if (node.initialY >= nodes[i - 1].initialY) {
                    nodes.splice(i, 0, node);
                    break;
                }
            }
        } else {
            nodes.push(node);
        }

        publishInitialState(node);
    }

    bindEvents();
    // bindPeriodic();

    (function setupDemo() {
        var els = document.querySelectorAll('li');
        function callback(target, colour, text) {
            target.style.backgroundColor = colour;
            target.innerHTML = text;
        }
        for (i in els) {
            if (els.hasOwnProperty(i)) {
                register(
                    els[i],
                    {
                        enter:   function(e, t) { callback(t, "orange", "Hi, I'm entering") },
                        leave:   function(e, t) { callback(t, "red", "Bye, I'm leaving") },
                        within:  function(e, t) { callback(t, "green", "I'm inside the viewport") },
                        outside: function(e, t) { callback(t, "white", "") }
                    }
                );
             }
        }
    })();
})();
