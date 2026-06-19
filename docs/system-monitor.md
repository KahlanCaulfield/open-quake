# System monitor (SystemView)

A built-in **System Monitor** page shows your PC's live state on the panel — CPU and GPU
load, memory, per-drive disk usage, network throughput, process count, and (on laptops)
battery. It's added automatically on first run as a page named **System Monitor**, and it's a
normal page you can rename, reorder, include in rotation, or delete (delete it and it stays gone).

Under the hood open-quake runs a tiny metrics server bound to `127.0.0.1` (loopback only —
never exposed on the network) and the page reads from it once a second. **No admin rights and
no extra software required.**

## Honest gaps — anything unavailable shows "—", never a fake `0`

- **CPU temperature** shows **"—"**. Windows doesn't expose CPU temperature to a normal app:
  the WMI thermal-zone class needs administrator rights and, on most modern CPUs, returns
  nothing anyway. Reading it reliably needs a kernel-level helper (e.g. LibreHardwareMonitor)
  run as admin — which open-quake deliberately doesn't bundle.
- **GPU load** works on **all GPUs** (Intel / AMD / NVIDIA) — read from the Windows GPU
  performance counters, the same source Task Manager uses, no admin.
- **GPU temperature** shows for **NVIDIA** cards (via `nvidia-smi`, which ships with the
  driver). **AMD and Intel GPUs show "—"** — their temperature is only available through a
  vendor SDK (AMD ADLX, Intel's control library) that we don't bundle, to keep open-quake
  portable and install-free.
- **Battery** appears on laptops; on a desktop (no battery) the widget is hidden.
