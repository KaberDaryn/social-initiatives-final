import { apiFetch, setSession, clearSession, getUser } from './api.js';

const $ = (sel) => document.querySelector(sel);
const view = $('#view');
const sessionStatus = $('#session-status');

function setActiveNav() {
  const h = location.hash || '#/';
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === h));
}

function toast(message, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function requireLogin(redirectHash) {
  const user = getUser();
  if (!user) {
    location.hash = '#/login';
    toast('Please sign in first', 'warn');
    return false;
  }
  if (redirectHash) location.hash = redirectHash;
  return true;
}

function renderSession() {
  const user = getUser();
  sessionStatus.textContent = user ? `Signed in as ${user.name} (${user.role})` : 'Not signed in';

  $('#nav-login').classList.toggle('hidden', Boolean(user));
  $('#nav-register').classList.toggle('hidden', Boolean(user));
  $('#nav-me').classList.toggle('hidden', !user);
  $('#nav-admin').classList.toggle('hidden', !(user && user.role === 'admin'));
  $('#btn-logout').classList.toggle('hidden', !user);
}

$('#btn-logout').addEventListener('click', () => {
  clearSession();
  renderSession();
  location.hash = '#/';
});

$('#btn-search').addEventListener('click', () => {
  if ((location.hash || '#/') !== '#/') location.hash = '#/';
  renderHome();
});

window.addEventListener('hashchange', () => {
  setActiveNav();
  route();
});

function parseRoute() {
  const hash = (location.hash || '#/').replace(/^#\//, '');
  const parts = hash.split('/').filter(Boolean);
  return parts;
}

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== undefined && v !== null) el.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined) return;
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}

function clearView() {
  view.innerHTML = '';
}

async function route() {
  const parts = parseRoute();
  const [first, second] = parts;

  if (!first) return renderHome();
  if (first === 'login') return renderLogin();
  if (first === 'register') return renderRegister();
  if (first === 'event' && second) return renderEvent(second);
  if (first === 'me') return renderMe();
  if (first === 'admin') return renderAdmin();

  clearView();
  view.appendChild(h('div', { class: 'card' }, [h('h2', {}, 'Not found')]));
}

async function renderHome() {
  clearView();

  const q = $('#search-q').value.trim();
  const type = $('#filter-type').value;

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (type) params.set('type', type);

  const list = h('div', { class: 'stack' });
  view.appendChild(
    h('div', { class: 'card' }, [
      h('h2', {}, 'Upcoming initiatives'),
      h('div', { class: 'muted' }, 'Browse published events. Sign in to join and comment.')
    ])
  );
  view.appendChild(list);

  try {
    const items = await apiFetch(`/api/events?${params.toString()}`, { auth: false });
    if (!items.length) {
      list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, 'No events found.')]));
      return;
    }

    items.forEach((e) => {
      list.appendChild(
        h('div', { class: 'card' }, [
          h('div', { class: 'row space' }, [
            h('div', {}, [
              h('div', { class: 'badge' }, `${e.type} • ${e.status}`),
              h('h3', {}, e.title),
              h('div', { class: 'muted' }, `${new Date(e.startAt).toLocaleString()} • ${e.location}`)
            ]),
            h('div', { class: 'row gap' }, [
              h(
                'a',
                { class: 'btn', href: `/#/event/${e._id}` },
                'Details'
              )
            ])
          ]),
          h('p', {}, e.description.slice(0, 160) + (e.description.length > 160 ? '…' : ''))
        ])
      );
    });
  } catch (e) {
    list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, e.message)]));
  }
}

function renderLogin() {
  clearView();

  const form = h('form', { class: 'stack' });
  form.appendChild(h('h2', {}, 'Login'));
  const email = h('input', { class: 'input', placeholder: 'Email', type: 'email', required: true });
  const pass = h('input', { class: 'input', placeholder: 'Password', type: 'password', required: true });
  const btn = h('button', { class: 'btn', type: 'submit' }, 'Sign in');

  form.appendChild(email);
  form.appendChild(pass);
  form.appendChild(btn);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { email: email.value.trim(), password: pass.value }
      });
      setSession(data);
      renderSession();
      toast('Signed in', 'ok');
      location.hash = '#/';
    } catch (e) {
      toast(e.message, 'danger');
    }
  });

  view.appendChild(h('div', { class: 'card' }, [form]));
}

function renderRegister() {
  clearView();

  const form = h('form', { class: 'stack' });
  form.appendChild(h('h2', {}, 'Register'));

  const name = h('input', { class: 'input', placeholder: 'Name', required: true });
  const email = h('input', { class: 'input', placeholder: 'Email', type: 'email', required: true });
  const pass = h('input', {
    class: 'input',
    placeholder: 'Password (min 8, 1 uppercase, 1 number)',
    type: 'password',
    required: true
  });
  const btn = h('button', { class: 'btn', type: 'submit' }, 'Create account');

  form.appendChild(name);
  form.appendChild(email);
  form.appendChild(pass);
  form.appendChild(btn);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: { name: name.value.trim(), email: email.value.trim(), password: pass.value }
      });
      setSession(data);
      renderSession();
      toast('Account created', 'ok');
      location.hash = '#/';
    } catch (e) {
      toast(e.message, 'danger');
    }
  });

  view.appendChild(h('div', { class: 'card' }, [form]));
}

async function renderMe() {
  if (!requireLogin()) return;
  clearView();

  const user = getUser();
  view.appendChild(
    h('div', { class: 'card' }, [
      h('h2', {}, 'My profile'),
      h('div', { class: 'muted' }, `${user.name} • ${user.email} • ${user.role}`)
    ])
  );

  const list = h('div', { class: 'stack' });
  view.appendChild(list);

  try {
    const items = await apiFetch('/api/me/bookings');
    if (!items.length) {
      list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, 'No active bookings yet.')]));
      return;
    }

    items.forEach((b) => {
      list.appendChild(
        h('div', { class: 'card' }, [
          h('div', { class: 'row space' }, [
            h('div', {}, [
              h('div', { class: 'badge' }, `booking • ${b.status}`),
              h('h3', {}, b.event.title),
              h('div', { class: 'muted' }, `${new Date(b.event.startAt).toLocaleString()} • ${b.event.location}`)
            ]),
            h('div', { class: 'row gap' }, [
              h('a', { class: 'btn', href: `/#/event/${b.event._id}` }, 'Open'),
              h(
                'button',
                {
                  class: 'btn danger',
                  onclick: async () => {
                    try {
                      await apiFetch(`/api/bookings/${b._id}`, { method: 'DELETE' });
                      toast('Booking cancelled', 'ok');
                      renderMe();
                    } catch (e) {
                      toast(e.message, 'danger');
                    }
                  }
                },
                'Cancel'
              )
            ])
          ])
        ])
      );
    });
  } catch (e) {
    list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, e.message)]));
  }
}

async function renderEvent(eventId) {
  clearView();
  const user = getUser();

  const header = h('div', { class: 'card' }, [h('div', { class: 'muted' }, 'Loading...')]);
  view.appendChild(header);
  const updatesWrap = h('div', { class: 'stack' });
  view.appendChild(updatesWrap);

  try {
    const event = await apiFetch(`/api/events/${eventId}`, { auth: Boolean(user) });

    const actions = h('div', { class: 'row gap' });

    if (user) {
      const status = await apiFetch(`/api/bookings/status/${eventId}`);
      if (!status.hasBooking) {
        actions.appendChild(
          h(
            'button',
            {
              class: 'btn',
              onclick: async () => {
                try {
                  await apiFetch('/api/bookings', { method: 'POST', body: { eventId } });
                  toast('Joined event', 'ok');
                  renderEvent(eventId);
                } catch (e) {
                  toast(e.message, 'danger');
                }
              }
            },
            'Join'
          )
        );
      } else {
        actions.appendChild(
          h(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                try {
                  await apiFetch(`/api/bookings/${status.bookingId}`, { method: 'DELETE' });
                  toast('Cancelled', 'ok');
                  renderEvent(eventId);
                } catch (e) {
                  toast(e.message, 'danger');
                }
              }
            },
            'Cancel booking'
          )
        );
      }
    } else {
      actions.appendChild(h('a', { class: 'btn', href: '/#/login' }, 'Sign in to join'));
    }

    header.innerHTML = '';
    header.appendChild(
      h('div', { class: 'row space' }, [
        h('div', {}, [
          h('div', { class: 'badge' }, `${event.type} • ${event.status}`),
          h('h2', {}, event.title),
          h('div', { class: 'muted' }, `${new Date(event.startAt).toLocaleString()} → ${new Date(event.endAt).toLocaleString()}`),
          h('div', { class: 'muted' }, `${event.location} • capacity ${event.capacity}`)
        ]),
        actions
      ])
    );
    header.appendChild(h('p', {}, event.description));

    // Updates
    updatesWrap.innerHTML = '';
    updatesWrap.appendChild(h('h2', {}, 'Updates'));

    if (user && user.role === 'admin') {
      updatesWrap.appendChild(renderCreateUpdateForm(eventId));
    }

    const updates = await apiFetch(`/api/updates/event/${eventId}`, { auth: Boolean(user) });
    if (!updates.length) {
      updatesWrap.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, 'No updates yet.')]));
      return;
    }

    for (const u of updates) {
      const card = h('div', { class: 'card' });
      card.appendChild(h('div', { class: 'badge' }, `update • ${new Date(u.createdAt).toLocaleString()}`));
      card.appendChild(h('h3', {}, u.title));
      card.appendChild(h('div', { class: 'muted' }, `by ${u.author?.name || 'Admin'}`));
      card.appendChild(h('p', {}, u.content));

      const commentsBox = h('div', { class: 'stack' });
      const comments = await apiFetch(`/api/comments/update/${u._id}`, { auth: false });

      commentsBox.appendChild(h('div', { class: 'muted' }, `Comments (${comments.length})`));
      comments.forEach((c) => {
        const row = h('div', { class: 'row space' }, [
          h('div', {}, [
            h('div', {}, c.text),
            h('div', { class: 'muted' }, `${c.author?.name || 'User'} • ${new Date(c.createdAt).toLocaleString()}`)
          ]),
          user
            ? h(
                'button',
                {
                  class: 'btn',
                  onclick: async () => {
                    try {
                      await apiFetch(`/api/comments/${c._id}`, { method: 'DELETE' });
                      toast('Comment deleted', 'ok');
                      renderEvent(eventId);
                    } catch (e) {
                      toast(e.message, 'danger');
                    }
                  }
                },
                'Delete'
              )
            : null
        ]);
        commentsBox.appendChild(row);
      });

      if (user) {
        const input = h('input', { class: 'input', placeholder: 'Write a comment...' });
        const send = h(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              try {
                await apiFetch('/api/comments', { method: 'POST', body: { updateId: u._id, text: input.value.trim() } });
                toast('Comment posted', 'ok');
                renderEvent(eventId);
              } catch (e) {
                toast(e.message, 'danger');
              }
            }
          },
          'Post'
        );
        commentsBox.appendChild(h('div', { class: 'row gap' }, [input, send]));
      } else {
        commentsBox.appendChild(h('div', { class: 'muted' }, 'Sign in to comment.'));
      }

      card.appendChild(h('hr', { class: 'hr' }));
      card.appendChild(commentsBox);

      if (user && user.role === 'admin') {
        card.appendChild(
          h(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                try {
                  await apiFetch(`/api/updates/${u._id}`, { method: 'DELETE' });
                  toast('Update deleted', 'ok');
                  renderEvent(eventId);
                } catch (e) {
                  toast(e.message, 'danger');
                }
              }
            },
            'Delete update'
          )
        );
      }

      updatesWrap.appendChild(card);
    }
  } catch (e) {
    header.innerHTML = '';
    header.appendChild(h('div', { class: 'muted' }, e.message));
  }
}

function renderCreateUpdateForm(eventId) {
  const wrap = h('div', { class: 'card' });
  wrap.appendChild(h('h3', {}, 'Post update (admin)'));

  const title = h('input', { class: 'input', placeholder: 'Title' });
  const content = h('textarea', { class: 'input', placeholder: 'Content', rows: '3' });
  const btn = h('button', { class: 'btn' }, 'Publish update');

  btn.addEventListener('click', async () => {
    try {
      await apiFetch('/api/updates', {
        method: 'POST',
        body: { eventId, title: title.value.trim(), content: content.value.trim() }
      });
      toast('Update published', 'ok');
      renderEvent(eventId);
    } catch (e) {
      toast(e.message, 'danger');
    }
  });

  wrap.appendChild(title);
  wrap.appendChild(content);
  wrap.appendChild(btn);
  return wrap;
}

async function renderAdmin() {
  if (!requireLogin('#/admin')) return;
  const user = getUser();
  if (user.role !== 'admin') {
    toast('Admin only', 'warn');
    location.hash = '#/';
    return;
  }

  clearView();
  view.appendChild(h('div', { class: 'card' }, [h('h2', {}, 'Admin dashboard'), h('div', { class: 'muted' }, 'Manage events and bookings.')]))

  const create = renderCreateEventForm();
  view.appendChild(create);

  const list = h('div', { class: 'stack' });
  view.appendChild(list);

  try {
    const items = await apiFetch('/api/events');
    if (!items.length) {
      list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, 'No events yet. Create one above.')]));
      return;
    }

    items.forEach((e) => {
      const card = h('div', { class: 'card' });
      card.appendChild(h('div', { class: 'badge' }, `${e.type} • ${e.status}`));
      card.appendChild(h('h3', {}, e.title));
      card.appendChild(h('div', { class: 'muted' }, `${new Date(e.startAt).toLocaleString()} • ${e.location}`));

      const actions = h('div', { class: 'row gap' });
      actions.appendChild(h('a', { class: 'btn', href: `/#/event/${e._id}` }, 'Open'));

      actions.appendChild(
        h(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              try {
                const next = e.status === 'published' ? 'draft' : 'published';
                await apiFetch(`/api/events/${e._id}/status`, { method: 'PATCH', body: { status: next } });
                toast(`Status: ${next}`, 'ok');
                renderAdmin();
              } catch (err) {
                toast(err.message, 'danger');
              }
            }
          },
          e.status === 'published' ? 'Unpublish' : 'Publish'
        )
      );

      actions.appendChild(
        h(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              const title = prompt('New title', e.title);
              if (!title) return;
              try {
                await apiFetch(`/api/events/${e._id}`, { method: 'PUT', body: { title } });
                toast('Updated', 'ok');
                renderAdmin();
              } catch (err) {
                toast(err.message, 'danger');
              }
            }
          },
          'Quick edit title'
        )
      );

      actions.appendChild(
        h(
          'button',
          {
            class: 'btn danger',
            onclick: async () => {
              if (!confirm('Delete event?')) return;
              try {
                await apiFetch(`/api/events/${e._id}`, { method: 'DELETE' });
                toast('Deleted', 'ok');
                renderAdmin();
              } catch (err) {
                toast(err.message, 'danger');
              }
            }
          },
          'Delete'
        )
      );

      actions.appendChild(
        h(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              try {
                const bookings = await apiFetch(`/api/admin/bookings?eventId=${e._id}`);
                alert(`Bookings for ${e.title}:\n\n` + bookings.map((b) => `${b.user.name} (${b.user.email})`).join('\n'));
              } catch (err) {
                toast(err.message, 'danger');
              }
            }
          },
          'View bookings'
        )
      );

      card.appendChild(actions);
      list.appendChild(card);
    });
  } catch (e) {
    list.appendChild(h('div', { class: 'card' }, [h('div', { class: 'muted' }, e.message)]));
  }
}

function renderCreateEventForm() {
  const wrap = h('div', { class: 'card stack' });
  wrap.appendChild(h('h3', {}, 'Create event'));

  const title = h('input', { class: 'input', placeholder: 'Title' });
  const description = h('textarea', { class: 'input', placeholder: 'Description', rows: '3' });
  const type = h('select', { class: 'input' }, [
    h('option', { value: 'workshop' }, 'workshop'),
    h('option', { value: 'community' }, 'community'),
    h('option', { value: 'other' }, 'other')
  ]);
  const startAt = h('input', { class: 'input', type: 'datetime-local' });
  const endAt = h('input', { class: 'input', type: 'datetime-local' });
  const location = h('input', { class: 'input', placeholder: 'Location' });
  const capacity = h('input', { class: 'input', type: 'number', placeholder: 'Capacity', value: '30' });

  const status = h('select', { class: 'input' }, [
    h('option', { value: 'draft' }, 'draft'),
    h('option', { value: 'published' }, 'published')
  ]);

  const btn = h('button', { class: 'btn' }, 'Create');

  btn.addEventListener('click', async () => {
    try {
      const payload = {
        title: title.value.trim(),
        description: description.value.trim(),
        type: type.value,
        status: status.value,
        startAt: startAt.value,
        endAt: endAt.value,
        location: location.value.trim(),
        capacity: Number(capacity.value)
      };

      await apiFetch('/api/events', { method: 'POST', body: payload });
      toast('Event created', 'ok');
      renderAdmin();
    } catch (e) {
      toast(e.message, 'danger');
    }
  });

  wrap.appendChild(h('div', { class: 'grid2' }, [title, type]));
  wrap.appendChild(description);
  wrap.appendChild(h('div', { class: 'grid2' }, [startAt, endAt]));
  wrap.appendChild(h('div', { class: 'grid2' }, [location, capacity]));
  wrap.appendChild(status);
  wrap.appendChild(btn);

  return wrap;
}

renderSession();
setActiveNav();
route();
