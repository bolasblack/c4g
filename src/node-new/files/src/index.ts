export function main() {
  console.log('hello from <%= name %>')
}

if (require.main === module) {
  main()
}
