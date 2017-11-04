update Standards set title = substring_index(title, '_', 1);
update Standards set title = substring_index(section, '_', 1) where title is null;
