// Default fallback title
const DEFAULT_TITLE = 'BudgetBuddy';

export function setPageTitle(title:string) {
  document.title = title || DEFAULT_TITLE;
}


export function setTitleWithSuffix(title:string) {
  setPageTitle(title + " | " + DEFAULT_TITLE);
}

export function setTitleWithPrefix(title:string) {
  setPageTitle(DEFAULT_TITLE + " - " + title);
}
