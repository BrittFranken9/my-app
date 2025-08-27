const fetcher = async (...args) => {
  const res = await fetch(...args);
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${msg}`);
  }
  // 204 = no content
  return res.status === 204 ? null : res.json();
};
export default fetcher;