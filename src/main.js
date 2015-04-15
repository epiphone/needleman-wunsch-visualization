'use strict';
/* global require */

var d3 = require('d3');
var $ = require('jquery');

var elem = $('#visualization');
var width;
var height;
var margin = {top: 10, left: 10, bottom: 10, right: 10};

var blocksGroup;
var blockWidth;
var blockMargin = 2;

var matrix;


var svg = d3.select(elem[0]).append('svg')
    .attr('width', width)
    .attr('height', height);

function initMatrix(n, m, gapPenalty) {
    var cols = n + 1;
    var rows = m + 1;
    matrix = [];
    width = elem.width();
    blockWidth = (width - margin.right - margin.left) / cols - blockMargin * 2;

    for (var i = 0; i < rows; i++) {
        matrix.push([]);
        for (var j = 0; j < cols; j++) {
            var val = null;

            if (i === 0) {
                val = j * gapPenalty;
            } else if (j === 0) {
                val = i * gapPenalty;
            }

            matrix[i].push(val);
        }
    }

    svg
        .attr('width', width)
        .attr('height', (blockWidth + blockMargin * 2) * m + margin.top + margin.bottom);

    blocksGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

function update() {
    var data = [];
    matrix.forEach(function(rows, i) {
        rows.forEach(function(d, j) {
            data.push({
                x: j,
                y: i,
                val: d,
            });
        });
    });

    blocksGroup.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', function(d) { return d.x * (blockWidth + blockMargin * 2) + blockMargin; })
            .attr('y', function(d) { return d.y * (blockWidth + blockMargin * 2) + blockMargin; })
            .attr('width', blockWidth)
            .attr('height', blockWidth)
            .attr('fill', 'red');
}

initMatrix(10, 6, -4);
update();
