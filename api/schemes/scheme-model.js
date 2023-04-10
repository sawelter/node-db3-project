const db = require("../../data/db-config")



async function find() { 
  const schemes = await db('schemes as sc')
    .leftJoin('steps as st', 'sc.scheme_id', '=', 'st.scheme_id')
    .select('sc.*')
    .count('st.step_id as number_of_steps')
    .groupBy('sc.scheme_id')
    .orderBy('sc.scheme_id', 'asc');

  return schemes;
}

async function findById(scheme_id) { 
  const rows = await db('schemes as sc')
    .select('sc.scheme_name', 'st.*', 'sc.scheme_id')
    .leftJoin('steps as st', 'sc.scheme_id', '=', 'st.scheme_id')
    .where('sc.scheme_id', scheme_id)
    .orderBy('st.step_number', 'asc');

  const result = rows.reduce((acc, row) => {
    if(row.instructions) {
      acc.steps.push({
        step_id: row.step_id,
        step_number: row.step_number,
        instructions: row.instructions
      })
    }
    return acc;
  }, { scheme_id: rows[0].scheme_id, scheme_name: rows[0].scheme_name, steps: [] });
  

  return result;
}

async function findSteps(scheme_id) { 
  
  const rows = await db('schemes as sc')
    .select('sc.scheme_name', 'st.step_id', 'st.step_number', 'st.instructions')
    .leftJoin('steps as st', 'sc.scheme_id', '=', 'st.scheme_id')
    .where('sc.scheme_id', scheme_id)
    .orderBy('st.step_number', 'asc');
    
  if(!rows[0].instructions) return []; //returns empty array if there are no steps
  return rows;
}

async function add(scheme) { 
  await db('schemes').insert(scheme);

  const newScheme = await db('schemes').where('scheme_name', scheme.scheme_name).first();

  return newScheme;
}

async function addStep(scheme_id, step) { 
  const newStep = {
    scheme_id: scheme_id,
    step_number: step.step_number,
    instructions: step.instructions
  }
  await db('steps').insert(newStep);

  return findSteps(scheme_id);


  // EXERCISE E
  /*
  insert into steps 
(scheme_id, step_number, instructions) values (9, 1, 'Steal Neptunes crown');
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
