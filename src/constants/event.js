const EVENT_TYPES = Object.freeze({
  WORKSHOP: 'workshop',
  COMMUNITY: 'community',
  OTHER: 'other'
});

const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
});

module.exports = { EVENT_TYPES, EVENT_STATUS };
