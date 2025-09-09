import { ReactComponent as LeafSvg } from "../../assets/images/logo-2.svg"

function IntroHeader() {
    return (
        <h1 className="text-3xl text-gray-800 font-bold">TaskFlow</h1>
    )
}

const LeafIcon = ({ size = 100, color = "green" }) => (
    <LeafSvg
        width={size}
        height={size}
        fill={color}
        className="mb-4 animate-bounce"
        aria-label="TaskFlow leaf logo"
    />
);


function IntroText() {
    return (
        <span className="text-lg text-gray-400 font-medium">Manage tasks Effortlessly</span>
    )
}

export default function MyApp() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-3 max-w-md mx-auto px-4">
            <LeafIcon size={80} color="green" />
            <IntroHeader />
            <IntroText />
        </div>
    )
}