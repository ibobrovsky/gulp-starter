import { IComponent } from '../../store/components'
import store from '../../store'

const getDepsComponents = (components: string[]): IComponent[] => {
  if (!components.length) {
    return []
  }

  const res: IComponent[] = []
  components.forEach((componentName) => {
    resolveDeps(componentName, res)
  })

  return res
}

export default getDepsComponents

function resolveDeps(componentName: string, res: IComponent[]): void {
  const component = store.components.getItem(componentName)
  if (!component) {
    return
  }

  if (component.depsComponents) {
    component.depsComponents.forEach((depsComponentName) => {
      resolveDeps(depsComponentName, res)
    })
  }

  if (!res.find(({ name }) => name === componentName)) {
    res.push(component)
  }
}
