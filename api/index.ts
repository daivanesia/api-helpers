import express, { Request, Response } from 'express'

// Weird workaround for CommonJS module
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { default: tex2svg } = require('node-tikzjax')

const app = express()

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

app.post('/tikz-to-svg', async (req: Request, res: Response) => {
  try {
    const { tikzCode } = req.body

    if (!tikzCode || typeof tikzCode !== 'string') {
      return res.status(400).json({
        message: 'TikZ code is required and must be a string',
      })
    }

    const svg = await tex2svg(tikzCode, {
      showConsole: true,
    })

    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svg)
  } catch (error) {
    console.error('Error converting TikZ to SVG:', error)
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

app.get('/tikz-to-svg-test', async (req: Request, res: Response) => {
  try {
    const sampleTikz = `
      \\begin{document}
      \\begin{tikzpicture}[domain=0:4]
        \\draw[very thin,color=gray] (-0.1,-1.1) grid (3.9,3.9);
        \\draw[->] (-0.2,0) -- (4.2,0) node[right] {$x$};
        \\draw[->] (0,-1.2) -- (0,4.2) node[above] {$f(x)$};
        \\draw[color=red]    plot (\\x,\\x)             node[right] {$f(x) =x$};
        \\draw[color=blue]   plot (\\x,{sin(\\x r)})    node[right] {$f(x) = \\sin x$};
        \\draw[color=orange] plot (\\x,{0.05*exp(\\x)}) node[right] {$f(x) = \\frac{1}{20} \\mathrm e^x$};
      \\end{tikzpicture}
      \\end{document}`

    const svg = await tex2svg(sampleTikz, {
      showConsole: true,
    })

    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svg)
  } catch (error) {
    console.error('Error in test endpoint:', error)
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server ready on port ${port}.`)
})

export default app
