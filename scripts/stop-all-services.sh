#!/bin/bash

# Stop All Microservices Script

echo "🛑 Stopping Catering System Services..."
echo "========================================"

# Kill all node processes for our services
if [ -d "pids" ]; then
  for pidfile in pids/*.pid; do
    if [ -f "$pidfile" ]; then
      pid=$(cat "$pidfile")
      service=$(basename "$pidfile" .pid)
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        echo "✓ Stopped $service (PID: $pid)"
      fi
      rm "$pidfile"
    fi
  done
fi

# Also kill any remaining node processes on our ports
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null
    echo "✓ Killed process on port $port"
  fi
done

echo ""
echo "All services stopped."
