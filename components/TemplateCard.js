import React from 'react';
import Link from 'next/link';

const TemplateCard = ({ template }) => {
  // CHANGE THIS
  console.log('inside the template card', template);
  return (
    <Link href={`/template/${template.templateId}`}>
      <div className='p-2 m-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-black'>
        <h2 className='text-xl'>{template.metadata.title}</h2>
        {/* <p>
          {notebook.userPages.length}/
          {notebook.template.metadata.prompts.length} prompts answered
        </p> */}
      </div>
    </Link>
  );
};

export default TemplateCard;
