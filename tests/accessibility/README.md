# Accessibility and visual acceptance

QA21-A11Y uses `EV21-UI + EV21-A11Y`. Automated axe output is necessary but not sufficient: keyboard order, focus visibility/return, semantic structure, reduced motion, responsive reflow and manual state meaning checks remain required.

The QA foundation also preserves the downstream visual gates:

- DOC-25 RC2: 89 Central Admin visual assertions (AC25-001..089), including 360x800, 768x1024 and 1440x900 usability.
- DOC-26 RC1: 112 public identity assertions (42 global + 70 site-specific).
- DOC-27 RC1: 2,281 visual assertions. Geometry tolerance is <=2 CSS px. Runtime comparison uses lossless PNG, per-channel threshold >16/255 and <=0.5% changed pixels after approved masks only. This threshold is necessary, not sufficient.

Do not use the JPEG atlas pages as pixel goldens. DOC-27 requires approved fonts/artwork and newly approved lossless PNG goldens with locked browser/DPR/fixture/build inputs. The referenced `contracts/acceptance.csv` companion is not in the current CHAT01 handoff, so its exact expanded rows must not be invented.
