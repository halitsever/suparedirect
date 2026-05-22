<p align="center" class="logo-section">
<img src="./assets/icon.svg" height="80" width="80"/>
</br>
<img src="https://halitsever-api.vercel.app/api/repo-title?title=Suparedirect">

<p align="center">
🔄 Lightweight anonymous redirect service with referer stripping<br>
<br/>
<br/>
<img src="https://img.shields.io/github/sponsors/halitsever"/>
</p>
<p align="center">
<a align="center" href="#">Documentation</a>
  </p>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/details"/>
</p>

<p align="center">

<img src="/assets/screenshot.png"/>

</p>

- 🧑‍💻 [**TODO**](#) - update docs

<p align="center" >
<img src="https://halitsever-api.vercel.app/api/installation"/>
</p>

Running via docker:

```bash
# expose api port only
docker run -p 3000:3000  halitsever/suparedirect:latest

# expose dashboard & api ports
docker run -p 3000:3000 -p 5173:5173  halitsever/suparedirect:latest

```

For development:

```bash
npm i
```

```bash
npm run start
```

Usage:

```bash
curl http://localhost:3000/?to=https://halit.org
```

you can use `to` parameter for redirecting to any website

<p align="center" href="https://github.com/halitsever/repo_name/issues">
<img src="https://halitsever-api.vercel.app/api/issue"/>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/sponsor"/>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/license"/>
</p>

<p align="center">
  MIT License - Halit Sever
</p>
