Place the photo you uploaded to the repository here and name it `auth-photo.jpg`.

Path: `docs/images/auth-photo.jpg`

This file is referenced by the login and signup pages to create the right-side illustration. If you prefer a different name, update the `src` in `docs/login.html` and `docs/signup.html` accordingly.

To add the image locally and push:

```bash
mkdir -p docs/images
# copy your photo into docs/images/auth-photo.jpg
git add docs/images/auth-photo.jpg
git commit -m "Add auth photo"
git push origin main
```
