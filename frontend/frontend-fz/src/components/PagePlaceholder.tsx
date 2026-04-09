export function PagePlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}
