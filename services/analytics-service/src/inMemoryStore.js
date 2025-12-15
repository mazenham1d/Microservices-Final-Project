// In-memory storage for analytics (no database required)
const logs = [];

// Add a log entry
const addLog = (logEntry) => {
  logs.push({
    ...logEntry,
    _id: Date.now().toString(),
    timestamp: new Date()
  });
  // Keep only last 1000 logs to prevent memory overflow
  if (logs.length > 1000) {
    logs.shift();
  }
};

// Get all logs
const getLogs = () => logs;

// Count documents (optionally with filter)
const countLogs = (filter = {}) => {
  if (Object.keys(filter).length === 0) {
    return logs.length;
  }
  return logs.filter(log => {
    for (const key in filter) {
      if (filter[key].$gte && log[key] < filter[key].$gte) return false;
      if (filter[key].$lte && log[key] > filter[key].$lte) return false;
      if (typeof filter[key] !== 'object' && log[key] !== filter[key]) return false;
    }
    return true;
  }).length;
};

// Aggregate statistics
const aggregate = (pipeline) => {
  const match = pipeline.find(p => p.$match);
  const group = pipeline.find(p => p.$group);
  const sort = pipeline.find(p => p.$sort);
  const limit = pipeline.find(p => p.$limit);

  let data = [...logs];

  // Apply $match
  if (match) {
    data = data.filter(log => {
      for (const key in match.$match) {
        const condition = match.$match[key];
        if (condition.$gte && log[key] < condition.$gte) return false;
        if (condition.$lte && log[key] > condition.$lte) return false;
      }
      return true;
    });
  }

  // Apply $group
  if (group) {
    const groups = {};
    data.forEach(log => {
      let groupKey;
      if (group.$group._id === null) {
        groupKey = 'null';
      } else if (typeof group.$group._id === 'object') {
        groupKey = JSON.stringify(
          Object.entries(group.$group._id).reduce((acc, [k, v]) => {
            acc[k] = log[v.replace('$', '')];
            return acc;
          }, {})
        );
      } else {
        groupKey = log[group.$group._id.replace('$', '')];
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { 
          _id: groupKey === 'null' ? null : (group.$group._id === null ? null : 
            (typeof group.$group._id === 'object' ? 
              Object.entries(group.$group._id).reduce((acc, [k, v]) => {
                acc[k] = log[v.replace('$', '')];
                return acc;
              }, {}) : log[group.$group._id.replace('$', '')]
            )), 
          items: [] 
        };
      }
      groups[groupKey].items.push(log);
    });

    data = Object.values(groups).map(g => {
      const result = { _id: g._id };
      for (const key in group.$group) {
        if (key === '_id') continue;
        const op = group.$group[key];
        if (op.$sum) {
          result[key] = g.items.length;
        } else if (op.$avg) {
          const field = op.$avg.replace('$', '');
          const values = g.items.map(i => i[field]).filter(v => v !== undefined);
          result[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
      }
      return result;
    });
  }

  // Apply $sort
  if (sort) {
    const sortKey = Object.keys(sort.$sort)[0];
    const sortDir = sort.$sort[sortKey];
    data.sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
  }

  // Apply $limit
  if (limit) {
    data = data.slice(0, limit.$limit);
  }

  return data;
};

module.exports = {
  addLog,
  getLogs,
  countLogs,
  aggregate
};
