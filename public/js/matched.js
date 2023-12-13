document.addEventListener('DOMContentLoaded', async () => {
  const queryStr = window.location.search;
  const id2 = new URLSearchParams(queryStr).get('id');
  try {
    let res = await fetch(`/matched?id=${id2}`);
    let json = await res.json();

    // Insert matched username
    let username = json.rows[0].username;
    document.querySelector('.matched-user').innerHTML = username;

    // Update match status in database as matched
    let res2 = await fetch('/matched', {
      method: 'put',
      body: JSON.stringify({ user2_id: id2, status: 'matched' }),
      headers: { 'Content-type': 'application/json' },
    });
    if (!res2.ok) {
      console.error('Failed to update status as matched');
    }
  } catch (e) {
    console.error('Failed to request data from server: ', e);
  }
});

document.querySelector('.exit-btn').addEventListener('click', () => {
  window.location.href = '/public/pending-matches.html';
});
