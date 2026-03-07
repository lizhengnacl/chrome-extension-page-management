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
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">未分组</h2>
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

      {groups.map((group) => {
        const groupPages = pages.filter((p) => p.groupId === group.id);
        return (
          <div key={group.id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenGroup(group.id)}
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
        <p className="text-gray-500 text-sm p-10 text-center">
          暂无分组，点击上方按钮添加
        </p>
      )}
    </div>
  );
}
