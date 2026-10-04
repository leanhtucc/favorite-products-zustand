import "./SearchBar.css"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="search-bar">
            <input
                type="search"
                aria-label="Tìm kiếm sản phẩm"
                placeholder="Tìm kiếm sản phẩm..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    )
}
