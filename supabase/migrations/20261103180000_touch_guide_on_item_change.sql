begin;

create or replace function public.touch_guide_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op <> 'INSERT' then
    update public.guides set updated_at = now() where id = old.guide_id;
  end if;

  if tg_op <> 'DELETE' then
    update public.guides set updated_at = now() where id = new.guide_id;
  end if;

  return null;
end;
$$;

create trigger touch_guide_on_item_change
after insert or update or delete on public.guide_items
for each row
execute function public.touch_guide_updated_at();

commit;