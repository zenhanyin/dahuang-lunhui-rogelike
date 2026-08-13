(function () {
  "use strict";

  const DEBUG_PARAM = "uiDebug";
  const METADATA_URLS = {
    runtime: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json",
    mobile: "assets/runtime/webp/ui/mobile_controls_atlas.json",
    legacyBounds: "assets/runtime/webp/ui/formal_v034a8/ui_bounds.v034b.json",
    storyArt: "assets/runtime/webp/ui/story/manifest-art.json"
  };

  const COMPONENTS = [
    {
      id: "hud",
      name: "HUD",
      selector: "#hud",
      metadata: "runtime.hud",
      safeAreas(metadata) {
        const hud = metadata.runtime?.hud;
        if (!hud?.safe || !hud?.size) return [];
        return Object.entries(hud.safe).map(([name, rect]) => ({
          name,
          rect,
          sourceSize: hud.size
        }));
      }
    },
    {
      id: "resource-soul",
      name: "Resource Soul",
      selector: "#topCounters .counter.soul",
      metadata: "runtime.sprites.resource_soul_wide",
      safeAreas(metadata) {
        const rect = metadata.runtime?.textSafe?.resource_number;
        const sprite = metadata.runtime?.sprites?.resource_soul_wide;
        return rect && sprite ? [{ name: "number", rect, sourceSize: [sprite.w, sprite.h] }] : [];
      }
    },
    {
      id: "resource-fire",
      name: "Resource Fire",
      selector: "#topCounters .counter.fire",
      metadata: "runtime.sprites.resource_fire_wide",
      safeAreas(metadata) {
        const rect = metadata.runtime?.textSafe?.resource_number;
        const sprite = metadata.runtime?.sprites?.resource_fire_wide;
        return rect && sprite ? [{ name: "number", rect, sourceSize: [sprite.w, sprite.h] }] : [];
      }
    },
    {
      id: "lineage-card",
      name: "Lineage Card",
      selector: "#lineageList .lineage",
      metadata: "TBD; legacyBounds.components.lineage_card available as migration reference only",
      safeAreas() {
        return [];
      }
    },
    {
      id: "choice-card",
      name: "Choice Card",
      selector: "#choiceList .choice",
      metadata: "TBD; legacyBounds.components.choice_card_frame available as migration reference only",
      safeAreas() {
        return [];
      }
    },
    {
      id: "story-ui",
      name: "Story UI",
      selector: "#storyOverlay .story-panel",
      metadata: "TBD; story art manifest conflicts with documented recommended size",
      safeAreas() {
        return [];
      }
    }
  ];

  let enabled = false;
  let overlay = null;
  let metadataCache = null;
  let raf = 0;

  function hasDebugParam() {
    try {
      return new URLSearchParams(window.location.search).get(DEBUG_PARAM) === "1";
    } catch {
      return false;
    }
  }

  function createOverlay() {
    const root = document.createElement("div");
    root.id = "uiDebugOverlay";
    root.setAttribute("aria-hidden", "true");
    Object.assign(root.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "none",
      font: "12px/1.2 Consolas, monospace",
      color: "#f7e9a8"
    });
    document.body.appendChild(root);
    return root;
  }

  function makeBox(rect, label, color, dashed = false) {
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: `1px ${dashed ? "dashed" : "solid"} ${color}`,
      boxSizing: "border-box",
      background: "transparent"
    });
    const tag = document.createElement("span");
    tag.textContent = label;
    Object.assign(tag.style, {
      position: "absolute",
      left: "0",
      top: "-16px",
      padding: "1px 4px",
      background: "rgba(0,0,0,0.72)",
      color,
      whiteSpace: "nowrap"
    });
    box.appendChild(tag);
    return box;
  }

  function makeAxis(x, top, height, label) {
    const axis = document.createElement("div");
    Object.assign(axis.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${top}px`,
      width: "0",
      height: `${height}px`,
      borderLeft: "1px solid rgba(124, 255, 223, 0.9)"
    });
    const tag = document.createElement("span");
    tag.textContent = label;
    Object.assign(tag.style, {
      position: "absolute",
      left: "4px",
      top: "0",
      padding: "1px 4px",
      background: "rgba(0,0,0,0.72)",
      color: "rgba(124, 255, 223, 0.95)",
      whiteSpace: "nowrap"
    });
    axis.appendChild(tag);
    return axis;
  }

  function scaleRect(sourceRect, sourceSize, targetRect) {
    const [x, y, w, h] = sourceRect;
    const [sourceW, sourceH] = sourceSize;
    return {
      left: targetRect.left + (x / sourceW) * targetRect.width,
      top: targetRect.top + (y / sourceH) * targetRect.height,
      width: (w / sourceW) * targetRect.width,
      height: (h / sourceH) * targetRect.height
    };
  }

  function getTextBoxes(element) {
    return [...element.querySelectorAll("h1,h2,p,small,label,span,b,strong,button,.brand,.bars,.stats,.lineage-art,.lineage-copy,.choice-icon,.choice-tag,.choice-title,.choice-body,.choice-cost,.story-portrait-wrap,.story-speaker")]
      .filter(node => node instanceof HTMLElement)
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
  }

  function draw() {
    if (!enabled || !overlay) return;
    overlay.replaceChildren();

    for (const component of COMPONENTS) {
      const nodes = document.querySelectorAll(component.selector);
      if (!nodes.length) continue;

      nodes.forEach((node, index) => {
        if (!(node instanceof HTMLElement)) return;
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        overlay.appendChild(makeBox(rect, `${component.name}${nodes.length > 1 ? ` #${index + 1}` : ""}`, "rgba(255, 90, 90, 0.95)"));
        overlay.appendChild(makeAxis(rect.left + rect.width / 2, rect.top, rect.height, "visual axis: DOM center"));

        const safeAreas = component.safeAreas(metadataCache || {});
        if (safeAreas.length) {
          for (const area of safeAreas) {
            overlay.appendChild(makeBox(scaleRect(area.rect, area.sourceSize, rect), `${component.name}.${area.name}`, "rgba(116, 255, 178, 0.95)", true));
          }
        } else {
          const tag = document.createElement("div");
          tag.textContent = `${component.name}: Safe Area TBD`;
          Object.assign(tag.style, {
            position: "fixed",
            left: `${rect.left}px`,
            top: `${rect.bottom + 2}px`,
            padding: "2px 5px",
            background: "rgba(0,0,0,0.72)",
            color: "rgba(255, 210, 88, 0.95)"
          });
          overlay.appendChild(tag);
        }

        for (const textNode of getTextBoxes(node)) {
          overlay.appendChild(makeBox(textNode.getBoundingClientRect(), textNode.id ? `#${textNode.id}` : textNode.className || textNode.tagName.toLowerCase(), "rgba(90, 160, 255, 0.9)", true));
        }
      });
    }

    raf = window.requestAnimationFrame(draw);
  }

  async function loadJson(url) {
    const response = await fetch(`${url}?ui-debug=${Date.now()}`);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }

  async function loadMetadata() {
    if (metadataCache) return metadataCache;
    const entries = await Promise.all(Object.entries(METADATA_URLS).map(async ([key, url]) => {
      try {
        return [key, await loadJson(url)];
      } catch (error) {
        return [key, { error: String(error?.message || error) }];
      }
    }));
    metadataCache = Object.fromEntries(entries);
    return metadataCache;
  }

  async function enable() {
    if (enabled) return;
    enabled = true;
    await loadMetadata();
    overlay = overlay || createOverlay();
    draw();
    console.info("[UI Debug] enabled", { metadata: metadataCache, components: COMPONENTS });
  }

  function disable() {
    enabled = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    overlay?.replaceChildren();
    console.info("[UI Debug] disabled");
  }

  window.DAHUANG_UI_DEBUG = {
    enable,
    disable,
    toggle() {
      return enabled ? disable() : enable();
    },
    get enabled() {
      return enabled;
    },
    get metadata() {
      return metadataCache;
    },
    components: COMPONENTS.map(({ id, name, selector, metadata }) => ({ id, name, selector, metadata }))
  };

  if (hasDebugParam()) {
    window.addEventListener("DOMContentLoaded", () => {
      enable().catch(error => console.warn("[UI Debug] failed to enable", error));
    });
  }
})();
