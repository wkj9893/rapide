interface RapidePlugin {
  name: string
  transform:
    | ((code: string, codePath: string) => string)
    | ((code: string, codePath: string) => Promise<string>)
}

interface RapideConfig {
  plugins: RapidePlugin[]
  ESModuleMap: Map<string, string>
  port: number
}
