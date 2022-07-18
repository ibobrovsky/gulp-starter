import { IPage } from '../../store/pages'
import { Injects } from '../../store/components'
import getDepsComponents from './getDepsComponents'

const getPageDepsInjects = (page: IPage): Injects => {
  const res: Injects = {
    scripts: [],
    styles: [],
    links: [],
  }

  getDepsComponents(page.components).forEach(({ injects, views }) => {
    if (!injects) {
      return
    }

    injects.scripts.forEach((script) => {
      if (!res.scripts.find((i) => i.path === script.path)) {
        res.scripts.push(script)
      }
    })

    injects.styles.forEach((style) => {
      if (!res.styles.find((i) => i.path === style.path)) {
        res.styles.push(style)
      }
    })

    injects.links.forEach((link) => {
      if (!res.links.find((i) => i.uid === link.uid)) {
        res.links.push(link)
      }
    })
  })

  return res
}

export default getPageDepsInjects
