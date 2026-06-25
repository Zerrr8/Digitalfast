class Mapping {
   constructor() {
      this.products = new Map()
      this.memory = new Map()
   }
}

const mapping = new Mapping
export default mapping
export const products = mapping.products
export const memory = mapping.memory