Postman collection for Agency Fleet Service

Import instructions

1. Open Postman -> Import -> Choose Files
2. Select `postman_collection_fleet.json` and `postman_environment_local.json` from `backend/fleet-service/postman/`.
3. Activate the `local` environment (top-right environment selector).
4. Ensure `baseUrl` is `http://localhost:3002` (change if your server runs on another port).

Run the tests

- After importing, you can run the collection with the Collection Runner:
  1. Click the collection "Agency Fleet Service - Tests" -> Run
  2. Make sure the `local` environment is selected.
  3. Click "Run". The runner will execute requests in order. The `Create Car` request will store `carId` into the environment and the following requests will use it.

Notes

- If your server is not running on `3002`, update the environment `baseUrl` before running.
- The tests assume the API returns standard shapes (example: `POST /api/cars` returns a JSON with `data._id`).
- You can re-run the collection multiple times; `Create Car` will overwrite `carId` each run.

If you want, I can also:
- Export a ready-to-import Postman collection file for you to download (already created in this repo).
- Extend assertions or add negative tests (invalid id, validation error cases).
