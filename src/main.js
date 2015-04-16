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
var _ = require('underscore');

var elem = $('#visualization');
var width;
var height;
var margin = {top: 20, left: 20, bottom: 10, right: 10};

var arrowsGroup;
var xLabelsGroup;
var yLabelsGroup;
var blocksGroup;

var blockWidth;
var blockFullWidth;
var blockMargin = 3;

var seqA;
var seqB;
var matchBonus = 1;
var mismatchPenalty = -1;
var gapPenalty = -1;
var matrix;
var nextMatrixPos;

var stepDuration = 1000;
var stepTimeout;


var svg = d3.select(elem[0]).append('svg')
    .attr('width', width)
    .attr('height', height);

function step() {
    // Check if finished, otherwise fill more
    if (nextMatrixPos.y >= matrix.length) {
        traceback();
    } else {
        updateMatrix();
        updateVisualization();
        stepTimeout = setTimeout(step, stepDuration);
    }
}

function initMatrix() {
    // Initialize the fill matrix
    matrix = [];
    nextMatrixPos = {x: 1, y: 1};

    var cols = seqA.length + 1;
    var rows = seqB.length + 1;
    width = elem.width();
    blockWidth = (width - margin.right - margin.left) / cols - blockMargin * 2;
    blockFullWidth = blockWidth + blockMargin * 2;

    for (var i = 0; i < rows; i++) {
        matrix.push([]);
        for (var j = 0; j < cols; j++) {
            var val = null;

            if (i === 0) {
                val = j * gapPenalty;
            } else if (j === 0) {
                val = i * gapPenalty;
            }

            matrix[i].push({score: val});
        }
    }

    // Initialize SVG container
    $(svg[0]).empty();

    svg.attr('width', width)
        .attr('height', blockFullWidth * rows + margin.top + margin.bottom);

    // Create an arrowhead marker for SVG paths
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 4)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L5,0L0,5L5");

    // SVG element groups
    blocksGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'blocks');

    arrowsGroup = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'arrows');

    xLabelsGroup = svg.append('g')
        .attr('class', 'labels x');

    yLabelsGroup = svg.append('g')
        .attr('class', 'labels y');

    // Draw labels
    xLabelsGroup.selectAll('text')
        .data(seqA)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', function(d, i) { return (i + 1.5) * blockFullWidth + margin.left; })
        .attr('y', 15)
        .text(function(d) { return d; });

    yLabelsGroup.selectAll('text')
        .data(seqB)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 10)
        .attr('y', function(d, i) { return (i + 1.5) * blockFullWidth + margin.top; })
        .text(function(d) { return d; });
}

function updateMatrix() {
    var i = nextMatrixPos.x;
    var j = nextMatrixPos.y;

    var scores = {
        diagonal: matrix[j-1][i-1].score + scoringFunc(seqA[i-1], seqB[j-1]),
        vertical: matrix[j-1][i].score + gapPenalty,
        horizontal: matrix[j][i-1].score + gapPenalty,
    };

    var maxScore = d3.max([scores.diagonal, scores.vertical, scores.horizontal]);
    matrix[j][i].score = maxScore;
    matrix[j][i].parents = Object.keys(scores).filter(function(d) {
        return scores[d] === maxScore;
    });

    if (nextMatrixPos.x === matrix[0].length - 1) {
        nextMatrixPos = {x: 1, y: nextMatrixPos.y + 1};
    } else {
        nextMatrixPos = {x: nextMatrixPos.x + 1, y: nextMatrixPos.y};
    }
}


function updateVisualization() {
    // Transform matrix data into visualization data
    var data = [];
    var arrows = [];
    matrix.forEach(function(row, i) {
        row.forEach(function(d, j) {
            if (d.score !== null) {
                data.push({
                    x: j,
                    y: i,
                    score: d.score,
                    parents: d.parents,
                });

                if (d.parents && d.parents.length > 0) {
                    d.parents.forEach(function(p) {
                        arrows.push({
                            x: j,
                            y: i,
                            dir: p,
                        });
                    });
                }
            }
        });
    });


    // Update visualization
    var blocksEnter = blocksGroup.selectAll('rect')
        .data(data, function(d) { return d.x + '-' + d.y; })
        .enter();

    blocksEnter.append('rect')
        .attr('x', function(d) { return d.x * blockFullWidth + blockMargin; })
        .attr('y', function(d) { return d.y * blockFullWidth + blockMargin; })
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('width', blockWidth)
        .attr('height', blockWidth)
        .attr('fill', getBlockColor)
        .attr('opacity', 0)
        .transition().duration(1000)
        .attr('opacity', 1);

    blocksEnter.append('text')
        .attr('x', function(d) { return (d.x + 0.5) * blockFullWidth; })
        .attr('y', function(d) { return (d.y + 0.5) * blockFullWidth; })
        .attr('text-anchor', 'middle')
        .text(function(d) { return d.score; })
        .attr('opacity', 0)
        .transition().duration(1000)
        .attr('opacity', 1)
        .attr('fill', '#5C4D4D');

    arrowsGroup.selectAll('line')
        .data(arrows, function(d) { return d.x + '-' + d.y + d.dir; }).enter()
        .append('line')
        .attr('x1', function(d) {
            if (d.dir === 'diagonal' || d.dir === 'horizontal') return (d.x + 0.25) * blockFullWidth;
            return (d.x + 0.5) * blockFullWidth;
        })
        .attr('y1', function(d) {
            if (d.dir === 'diagonal' || d.dir === 'vertical') return (d.y + 0.25) * blockFullWidth;
            return (d.y + 0.5) * blockFullWidth;
        })
        .attr('x2', function(d) {
            if (d.dir === 'diagonal' || d.dir === 'horizontal') return (d.x - 0.25) * blockFullWidth;
            return (d.x + 0.5) * blockFullWidth;
        })
        .attr('y2', function(d) {
            if (d.dir === 'diagonal' || d.dir === 'vertical') return (d.y - 0.25) * blockFullWidth;
            return (d.y + 0.5) * blockFullWidth;
        })
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke', 'black')
        .attr('stroke-width', 4)
        .attr('opacity', 0)
        .transition().duration(1000)
        .attr('opacity', 0.1);
}

function traceback() { console.log(getTracebacks()); }

function getTracebacks() {
    function recur(x, y, prev) {

        if (x === 0 && y === 0) return [prev];

        var pos = matrix[y][x];
        var a = seqA[x-1];
        var b = seqB[y-1];
        if (a === undefined || b === undefined) console.log(x, y, prev);

        var alignments = pos.parents.map(function(p) {
            if (p === 'diagonal') return recur(x-1, y-1, {a: a + prev.a, b: b + prev.b});
            if (p === 'horizontal') return recur(x-1, y, {a: a + prev.a, b: '-' + prev.b});
            return recur(x, y-1, {a: '-' + prev.a, b: b + prev.b});
        });

        return _.flatten(alignments);
    }

    return recur(seqA.length, seqB.length, {a: '', b: ''});
}

function getBlockColor(d) {
    return '#DEEDFC';
}

var scoringFunc = function(a, b) {
    return a === b ? matchBonus : mismatchPenalty;
};

$('form').on('submit', start);

/* Read inputs from form, start animation. */
function start() {
    seqA = $('#seqA').val();
    seqB = $('#seqB').val();
    matchBonus = parseFloat($('#match').val());
    mismatchPenalty = parseFloat($('#mismatch').val());
    gapPenalty = parseFloat($('#gap').val());
    stepDuration = parseFloat($('#step').val());

    clearTimeout(stepTimeout);
    window.location.hash = '#visualization';
    initMatrix();
    updateVisualization();
    setTimeout(step, 1); // TODO check time
    return false;
}

