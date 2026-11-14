import './Tags.css';

const defaultTags = ['Wedding', 'Event', 'Couple'];

export default function Tags({
                                 tags = defaultTags,
                                 basePath = '/tags',
                                 label = 'Tag',
                                 showIcon = true,
                                 variant = 'default', // 'default' | 'soft' | 'outline'
                             }) {
    if (!tags?.length) return null;

    return (
        <div className={`tags tags--${variant}`}>
            {label && (
                <span className="tags__label">
          {showIcon && <i className="fa fa-tag" aria-hidden="true" />}
                    {label}:
        </span>
            )}

            <ul className="tags__list">
                {tags.map((tag) => {
                    const slug = encodeURIComponent(tag.toLowerCase());
                    return (
                        <li key={tag}>
                            <a className="tags__pill" href={`${basePath}/${slug}`}>
                                {tag}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}