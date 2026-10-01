'use strict';

const { Plugin } = require('obsidian');

/**
 * Remove Tabs
 *
 * 1. Every request for a new tab (Cmd/Ctrl+click, middle-click, "Open in new tab",
 *    the New tab command, etc.) is redirected to the current leaf, so the file
 *    replaces what is open instead of spawning a tab.
 * 2. As a safety net, any tab group in the main area (or a popout window) that
 *    still ends up with more than one tab is collapsed down to the visible one.
 * 3. styles.css hides the tab bar itself.
 *
 * Sidebars are left alone: their tab headers are how you switch between
 * File explorer, Search, Outline, etc.
 */
module.exports = class RemoveTabsPlugin extends Plugin {
	onload() {
		this.pending = null;
		this.patchGetLeaf();

		const schedule = () => this.scheduleEnforce();
		this.app.workspace.onLayoutReady(schedule);
		this.registerEvent(this.app.workspace.on('layout-change', schedule));
		this.registerEvent(this.app.workspace.on('active-leaf-change', schedule));
		this.registerEvent(this.app.workspace.on('window-open', schedule));
	}

	onunload() {
		if (this.pending !== null) window.clearTimeout(this.pending);
	}

	patchGetLeaf() {
		const ws = this.app.workspace;
		const hadOwn = Object.prototype.hasOwnProperty.call(ws, 'getLeaf');
		const original = ws.getLeaf;
		let enabled = true;

		const wrapper = function (newLeaf, ...rest) {
			if (enabled && (newLeaf === true || newLeaf === 'tab')) newLeaf = false;
			return original.call(this, newLeaf, ...rest);
		};
		ws.getLeaf = wrapper;

		this.register(() => {
			enabled = false;
			// Only restore if nobody patched on top of us; otherwise the wrapper
			// stays in the chain as a harmless pass-through.
			if (ws.getLeaf !== wrapper) return;
			if (hadOwn) ws.getLeaf = original;
			else delete ws.getLeaf;
		});
	}

	scheduleEnforce() {
		if (this.pending !== null) return;
		// Defer so the workspace finishes activating/opening the new leaf first.
		this.pending = window.setTimeout(() => {
			this.pending = null;
			this.enforceSingleTab();
		}, 0);
	}

	enforceSingleTab() {
		const ws = this.app.workspace;
		const groups = new Map();

		ws.iterateAllLeaves((leaf) => {
			const root = leaf.getRoot();
			if (root === ws.leftSplit || root === ws.rightSplit) return;
			const group = leaf.parent;
			if (!group) return;
			if (!groups.has(group)) groups.set(group, []);
			groups.get(group).push(leaf);
		});

		for (const [group, leaves] of groups) {
			if (leaves.length < 2) continue;
			const keep = this.pickLeafToKeep(group, leaves);
			for (const leaf of leaves) {
				if (leaf !== keep) leaf.detach();
			}
		}
	}

	pickLeafToKeep(group, leaves) {
		// The tab currently shown in this group is "what you have open".
		const visible = Array.isArray(group.children) ? group.children[group.currentTab] : undefined;
		if (visible && leaves.includes(visible)) return visible;

		const active = this.app.workspace.getMostRecentLeaf(group.getRoot());
		if (active && leaves.includes(active)) return active;

		return leaves[leaves.length - 1];
	}
};
