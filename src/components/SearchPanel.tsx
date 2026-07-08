import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

const SEARCH_DEBOUNCE_MS = 500;

export function SearchPanel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urlKeyword = params.get("q") ?? "";
  const [keyword, setKeyword] = useState(urlKeyword);

  function navigateToSearch(value: string) {
    const q = value.trim();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    const query = sp.toString();
    navigate(query ? `/list?${query}` : "/list");
  }

  useEffect(() => {
    setKeyword(urlKeyword);
  }, [urlKeyword]);

  useEffect(() => {
    if (keyword.trim() === urlKeyword.trim()) return;
    const timer = window.setTimeout(() => {
      navigateToSearch(keyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [keyword, navigate, urlKeyword]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigateToSearch(keyword);
  }

  return (
    <form className="search-panel" onSubmit={handleSubmit} role="search">
      <div className="search-panel__form">
        <div className="search-panel__input-wrapper">
          <Search size={16} className="search-panel__search-icon" />
          <input
            className="search-panel__input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索视频标题或作者"
            aria-label="搜索关键词"
          />
        </div>
        <button className="search-panel__submit" type="submit">
          <Search size={16} className="search-panel__submit-icon" />
          <span className="search-panel__submit-text">搜索</span>
        </button>
      </div>
    </form>
  );
}
