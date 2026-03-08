import { Button } from '../common';
import { PageList } from './PageList';
import type { Page, Group, Tag } from '../../types';

interface GroupsSectionProps {
  pages: Page[];
  groups: Group[];
  tags: Tag[];
  onToggleFavorite: (pageId: string) => Promise<void>;
  onEdit: (pageId: string) => void;
  onDelete: (pageId: string) => Promise<void>;
  onOpenGroup: (groupId: string | null) => Promise<void>;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export function GroupsSection({
  pages,
  groups,
  tags,
  onToggleFavorite,
  onEdit,
  onDelete,
  onOpenGroup,
  onEditGroup,
  onDeleteGroup,
}: GroupsSectionProps) {
  const ungroupedPages = pages.filter((p) => !p.groupId);

  return (
    <div className="flex flex-col gap-6">
      {ungroupedPages.length > 0 && (
        <div className="bg-background-secondary/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-text-muted to-text-secondary flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 7h-9a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="3" x2="13" y1="12" y2="12" />
                  <line x1="3" x2="13" y1="16" y2="16" />
                  <line x1="3" x2="9" y1="20" y2="20" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary">未分组</h2>
            </div>
          </div>
          <PageList
            pages={ungroupedPages}
            tags={tags}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage="该分组暂无页面"
          />
        </div>
      )}

      {groups.map((group, index) => {
        const groupPages = pages.filter((p) => p.groupId === group.id);
        return (
          <div
            key={group.id}
            className="bg-background-secondary/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl animate-slide-in-right"
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <svg
                    className="w-5 h-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l2.4 7.4h7.6l-6.1 4.4 2.3 7.2-6.2-4.5-6.2 4.5 2.3-7.2-6.1-4.4h7.6z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary">{group.name}</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenGroup(group.id)}
                  className="text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                  打开全部
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditGroup(group.id)}
                  className="text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  编辑
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="ghost"
                  onClick={() => onDeleteGroup(group.id)}
                  className="text-text-secondary hover:text-danger hover:bg-danger/10"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  删除
                </Button>
              </div>
            </div>
            <PageList
              pages={groupPages}
              tags={tags}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              emptyMessage="该分组暂无页面"
            />
          </div>
        );
      })}

      {ungroupedPages.length === 0 && groups.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-background-tertiary/50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-text-muted"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p className="text-text-muted text-lg">暂无分组，点击上方按钮添加</p>
        </div>
      )}
    </div>
  );
}
