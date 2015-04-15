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
var nextMatrixPos;

var fillStep = 500;


var svg = d3.select(elem[0]).append('svg')
    .attr('width', width)
    .attr('height', height);

function initMatrix(n, m, gapPenalty) {
    matrix = [];
    nextMatrixPos = {x: 1, y: 1};

    var cols = n + 1;
    var rows = m + 1;
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
        .attr('height', (blockWidth + blockMargin * 2) * rows + margin.top + margin.bottom);

    blocksGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

function fill() {
    // Fill the next empty matrix position
    matrix[nextMatrixPos.y][nextMatrixPos.x] = 1;
    if (nextMatrixPos.x === matrix[0].length - 1) {
        nextMatrixPos = {x: 1, y: nextMatrixPos.y + 1};
    } else {
        nextMatrixPos = {x: nextMatrixPos.x + 1, y: nextMatrixPos.y};
    }


    // Transform matrix data into visualization data
    var data = [];
    matrix.forEach(function(row, i) {
        row.forEach(function(d, j) {
            if (d !== null) {
                data.push({
                    x: j,
                    y: i,
                    val: d,
                });
            }
        });
    });

    // Update visualization
    blocksGroup.selectAll('rect')
        .data(data, function(d) { return d.x + '-' + d.y; })
        .enter()
        .append('rect')
            .attr('x', function(d) { return d.x * (blockWidth + blockMargin * 2) + blockMargin; })
            .attr('y', function(d) { return d.y * (blockWidth + blockMargin * 2) + blockMargin; })
            .attr('width', blockWidth)
            .attr('height', blockWidth)
            .attr('fill', getBlockColor)
            .attr('opacity', 0)
            .transition().duration(1000)
            .attr('opacity', 1);

    // Check if finished, otherwise fill more
    if (nextMatrixPos.y >= matrix.length) {
        console.log('traceback TODO');
    } else {
        setTimeout(fill, fillStep);
    }
}

function getBlockColor(d) {
    return 'steelblue';
}

initMatrix(10, 6, -4);
fill();
