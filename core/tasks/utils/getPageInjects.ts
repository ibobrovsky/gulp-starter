import store from '../../store'
import { Injects } from '../../store/modules/components'

const getPageInjects = (pageName: string): Injects => {
  const page = store.pages.items[pageName]
  const res: Injects = {
    scripts: [],
    styles: [],
    links: [],
  }

  if (!page) {
    return res
  }

  page.components?.forEach((componentName) => {
    const component = store.components[componentName]
    if (!component) {
      return
    }

    component.injects?.scripts.forEach((script) => {
      if (!res.scripts.find((i) => i.path === script.path)) {
        res.scripts.push(script)
      }
    })

    component.injects?.styles.forEach((style) => {
      if (!res.styles.find((i) => i.path === style.path)) {
        res.styles.push(style)
      }
    })

    component.injects?.links.forEach((link) => {
      if (!res.links.find((i) => i.uid === link.uid)) {
        res.links.push(link)
      }
    })
  })

  return res
}

export default getPageInjects
