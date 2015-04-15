/**
 * Visualization for the Needleman-Wunsch algorithm.
 *
 * Aleksi Pekkala (aleksi.v.a.pekkala@student.jyu.fi)
 * 15.4.2015
 */

'use strict';
/* global require */


var d3 = require('d3');
var $ = require('jquery');

var elem = $('#visualization');
var width;
var height;
var margin = {top: 10, left: 10, bottom: 10, right: 10};

var arrowsGroup;
var labelsGroup;
var blocksGroup;
var blockWidth;
var blockMargin = 3;

var seqA;
var seqB;
var gapPenalty;
var scoringFunc;
var matrix;
var nextMatrixPos;

var fillStep = 500;


var svg = d3.select(elem[0]).append('svg')
    .attr('width', width)
    .attr('height', height);

function step() {
    // Check if finished, otherwise fill more
    if (nextMatrixPos.y >= matrix.length) {
        console.log('traceback TODO');
    } else {
        updateMatrix();
        updateVisualization();
        setTimeout(step, fillStep);
    }
}

function initMatrix() {
    matrix = [];
    nextMatrixPos = {x: 1, y: 1};

    var cols = seqA.length + 1;
    var rows = seqB.length + 1;
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

    svg.attr('width', width)
        .attr('height', (blockWidth + blockMargin * 2) * rows + margin.top + margin.bottom);

    blocksGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'blocks');

    arrowsGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'arrows');

    labelsGroup = svg.append('g')
        .attr('class', 'labels');
}

function updateMatrix() {
    var i = nextMatrixPos.x;
    var j = nextMatrixPos.y;
    matrix[j][i] = d3.max([
        matrix[j-1][i-1] + scoringFunc(seqA[i-1], seqB[j-1]),   // match/mismatch in the diagonal
        matrix[j-1][i] + gapPenalty,                            // gap in sequence #1
        matrix[j][i-1] + gapPenalty,                            // gap in sequence #2
    ]);

    if (nextMatrixPos.x === matrix[0].length - 1) {
        nextMatrixPos = {x: 1, y: nextMatrixPos.y + 1};
    } else {
        nextMatrixPos = {x: nextMatrixPos.x + 1, y: nextMatrixPos.y};
    }
}


function updateVisualization() {
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
    var blocksEnter = blocksGroup.selectAll('rect')
        .data(data, function(d) { return d.x + '-' + d.y; })
        .enter();

    blocksEnter.append('rect')
        .attr('x', function(d) { return d.x * (blockWidth + blockMargin * 2) + blockMargin; })
        .attr('y', function(d) { return d.y * (blockWidth + blockMargin * 2) + blockMargin; })
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('width', blockWidth)
        .attr('height', blockWidth)
        .attr('fill', getBlockColor)
        .attr('opacity', 0)
        .transition().duration(1000)
        .attr('opacity', 1);

    blocksEnter.append('text')
        .attr('x', function(d) { return (d.x + 0.5) * (blockWidth + blockMargin * 2); })
        .attr('y', function(d) { return (d.y + 0.5) * (blockWidth + blockMargin * 2); })
        .attr('text-anchor', 'middle')
        .text(function(d) { return d.val; })
        .attr('opacity', 0)
        .transition().duration(1000)
        .attr('opacity', 1)
        .attr('fill', '#5C4D4D');
}

function getBlockColor(d) {
    return '#DEEDFC';
}


// TODO TESTING
seqA = 'GAATTCAGTTA';
seqB = 'GGATCGA';
gapPenalty = -4;
scoringFunc = function(a, b) {
    return a === b ? 5 : -3;
};


function start() {
    initMatrix();
    updateVisualization();
    setTimeout(step, 2000);
}

start();
