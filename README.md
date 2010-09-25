What is it?
===========

JsDataFlowEditor is a graph editing widget based on Raphael.  It's optimally suited for building and manipulating dataflows, e.g. compositing chains, audio synthesis, graphics production, etc.  The look and feel is largely inspired by Blender and Quartz Composer.

Have any examples?
==================

- [http://daeken.github.com/JsDataFlowEditor/Examples/Alyn/](http://daeken.github.com/JsDataFlowEditor/Examples/Alyn/) -- Work in progress audio synthesizer

How do you use it?
==================

Pull in Raphael 1.5.2, JQuery 1.3.2 (1.4.2 seems to be broken with this for some reason), and jsdatafloweditor.js.

Create a graphEditor object, create graphNodes and add points to them, and optionally connect them automatically.  You can also attach to various events on the nodes, e.g. when another node is connected/disconnected.

Documentation
=============

`new graphEditor(element_id, width, height[, theme])`.  Parameters:

- `element_id` -- ID to the graph container in the DOM.  This can be a table cell, div, etc.
- `width` and `height` -- Dimensions of the graph editor.
- `theme` -- Optional.  Hash containing the following keys (use as many or as few as you wish to customize):
	- nodeFill -- Background color for graph nodes
	- pointInactive -- Connection point fill color when not connected
	- pointActive -- Connection point fill color when connected
	- connectingFill -- Fill for the line while connecting
	- connectingStroke -- Stroke for the line while connecting
	- connectingStrokeWidth -- Width of the line while connecting
	- lineFill -- Fill for the line when connected
	- lineStroke -- Stroke for the line when connected
	- lineStrokeWidth -- Width of the line when connected

`graphEditor.addNode(x, y, node)`.  Parameters:

- `x` and `y` -- Coordinates for the upper-left corner of the node to add.
- `node` -- `graphNode` object.

`new graphNode(id, title)`. Parameters:

- `id` -- ID for this graph node.  At the moment, this is simply stored as `.id` on the node and not used.
- `title` -- Title as shown on the node.

`graphNode` contains the following events, which can be registered to via `nodeObject.eventType.add(yourFunction)` or triggered via `nodeObject.eventType(params...)`:

- `focus()` -- Node has focus
- `blur()` -- Node has lost focus
- `connect(thisPoint, otherPoint)` -- Connected to another node.  Parameters are `point` objects.
- `disconnect()` -- Disconnected from another node.  Parameters are `point` objects.
- `update()` -- Data in the node has been updated.  Must be called by you if you need data updating support.
- `remove()` -- Node has been removed.  Can be called by you to delete the node.

`graphNode.addPoint(label, dir[, multi])`.  Parameters:

- `label` -- Label for the connection point.
- `dir` -- Direction of the connection point, `'in'` or `'out'`.
- `multi` -- Optional.  Boolean to determine whether it can be connected to multiple other points.  This defaults to `false` for inputs (meaning inputs by default can only be connected to one element) and `true` for outputs.

`point` object properties:

- `label` -- Label for this connection point.
- `connection` -- Array of connections to other nodes.

Connecting points automatically is messy at this point, but can be done using the `point.connect` method.  Consult the source if you want to go down that rabbit hole.  That API will be changing shortly.

Known/future issues
===================

- Connecting points can sometimes be difficult due to the precision necessary to select the proper Raphael element.
- In some Chrome builds, dragging nodes around seems to glitch out badly.
- The API for connecting points programatically is a mess.
- Themability is limited to colors right now, really, rather than being able to drastically change the look and feel.
- It'd be nice to be able to put values on the nodes themselves, much like Blender's compositor.
