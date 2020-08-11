import {find} from 'lodash';

const isNewURL = (existingUrls: Map<string, URL[]>, potentialNewUrl: URL): boolean => {
  const hostName = potentialNewUrl.hostname;
  if (!existingUrls.has(hostName)) {
    return true;
  }

  const urlsForHost = existingUrls.get(hostName) || [];

  const matchingURL = find(urlsForHost, (u) => u.href === potentialNewUrl.href);

  return !matchingURL;
};

const getNewUrls = (existingUrls: Map<string, URL[]>, foundUrls: URL[]): URL[] => {
  return foundUrls.filter((u) => isNewURL(existingUrls, u));
};

export {getNewUrls};
