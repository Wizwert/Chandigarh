
const isNewURL = (existingUrls: Map<string, URL[]>, potentialNewUrl: URL): boolean => {
  const hostName = potentialNewUrl.hostname;
  if (!existingUrls.has(hostName)) {
    return true;
  }

  const urlsForHost = existingUrls.get(hostName) || [];
  return urlsForHost.includes(potentialNewUrl);
};

const getNewUrls = (existingUrls: Map<string, URL[]>, foundUrls: URL[]): URL[] => {
  return foundUrls.filter((u) => isNewURL(existingUrls, u));
};

export {getNewUrls};
