import React from 'react';
import Link from 'next/link';

const TemplateCard = ({ template }) => {
  // CHANGE THIS
  console.log('inside the template card', template);
  return (
    <Link href={`/template/${template.templateId}`}>
      <div className='p-2 m-2 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-black'>
        <h2 className='text-2xl'>{template.metadata.title}</h2>
        <p>
          {template.supply} / {template.metadata.supply} available
        </p>

        <p className='text-xs'>{template.price} eth</p>
      </div>
    </Link>
  );
};

export default TemplateCard;
