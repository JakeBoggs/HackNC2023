# Cogniscribe

Instructions

```
cd backend
python server.py &
caddy run &
```

```
cd frontend
pnpm run dev
```

You may need to use Ngrok or some proxy with HTTPS so that modern browsers will allow using the Web Audio API.
```
ngrok http 8900
```
