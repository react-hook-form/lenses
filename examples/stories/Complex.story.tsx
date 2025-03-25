import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

import { NumberInput, StringInput } from './components';

export default {
  title: 'Complex',
} satisfies Meta;

export interface Actor {
  name: string;
  birthYear: number;
}

export interface Movie {
  title: string;
  summary: string;
  actors: Actor[];
}
export interface Owner {
  personName: string;
  yearOfBirth: number;
}

export interface Studio {
  name: string;
  location: string;
  owner: Owner;
}

export interface MovieCollection {
  studio: Studio;
  movies: Movie[];
}

export interface ComplexProps {
  onSubmit: SubmitHandler<MovieCollection>;
}

export function Complex({ onSubmit = action('submit') }: ComplexProps) {
  const { handleSubmit, control } = useForm<MovieCollection>();
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StringInput lens={lens.focus('studio.name')} label="Studio Name" />
      <StringInput lens={lens.focus('studio.location')} label="Studio Location" />

      <hr />
      <PersonForm
        lens={lens.focus('studio.owner').reflect(({ personName, yearOfBirth }) => ({ name: personName, birthYear: yearOfBirth }))}
      />

      <hr />
      <MoviesForm lens={lens.focus('movies')} />

      <button>Submit</button>
    </form>
  );
}

function MoviesForm({ lens }: { lens: Lens<Movie[]> }) {
  const { fields, append, remove } = useFieldArray(lens.interop());

  return (
    <div>
      <div>
        <button onClick={() => append({ title: '', summary: '', actors: [] })}>Add Movie</button>
      </div>

      {lens.map(fields, (value, l, index) => (
        <div key={value.id}>
          <button onClick={() => remove(index)}>Remove</button>
          <StringInput lens={l.focus('title')} label="Title" />
          <StringInput lens={l.focus('summary')} label="Summary" />
          <ActorsForm lens={l.focus('actors')} />
          <hr />
        </div>
      ))}
    </div>
  );
}

function ActorsForm({ lens }: { lens: Lens<Actor[]> }) {
  const { fields, append, remove } = useFieldArray(lens.interop());

  return (
    <div>
      <div>
        <button onClick={() => append({ name: '', birthYear: 0 })}>Add Actor</button>
      </div>
      {lens.map(fields, (value, l, index) => (
        <div key={value.id}>
          <button onClick={() => remove(index)}>Remove</button>
          <PersonForm lens={l} />
        </div>
      ))}
    </div>
  );
}

interface PersonFormData {
  name: string;
  birthYear: number;
}

function PersonForm({ lens }: { lens: Lens<PersonFormData> }) {
  return (
    <div>
      <StringInput lens={lens.focus('name')} label="Name" />
      <br />
      <NumberInput lens={lens.focus('birthYear')} label="Birth Year" />
    </div>
  );
}
