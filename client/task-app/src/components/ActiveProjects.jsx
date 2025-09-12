// ActiveProjects.jsx
export default function ActiveProjects({ projects }) {
    return (
        <section className="mt-6">
            <h3 className="text-lg font-semibold">Active Projects</h3>
            <ul className="list-disc ml-5">
                {projects.map((p) => (
                    <li key={p.id}>{p.name}</li>
                ))}
            </ul>
        </section>
    );
}
