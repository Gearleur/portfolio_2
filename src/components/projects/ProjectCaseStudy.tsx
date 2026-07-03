import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { CaseStudy } from '../../data/projects';
import { PointLattice } from './PointLattice';

type ProjectCaseStudyProps = {
  caseStudy: CaseStudy;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function ProjectCaseStudy({ caseStudy, scrollRef }: ProjectCaseStudyProps) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const challengeCount = caseStudy.challenges.length;

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { root, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    const steps = stepRefs.current.filter((el): el is HTMLElement => el !== null);
    steps.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [scrollRef, challengeCount]);

  const labels = caseStudy.challenges.map((challenge) => challenge.tag);

  return (
    <section className="cstudy">
      <p className="cstudy__context">{caseStudy.context}</p>

      <div className="cstudy__grid">
        <div className="cstudy__sticky">
          <PointLattice depth={challengeCount} activeIndex={active} />
          <div className="cstudy__readout">
            <span className="cstudy__readout-index">
              {String(active + 1).padStart(2, '0')} / {String(challengeCount).padStart(2, '0')}
            </span>
            <span className="cstudy__readout-tag">{labels[active]}</span>
          </div>
        </div>

        <div className="cstudy__steps">
          {caseStudy.challenges.map((challenge, index) => (
            <article
              className={`cstep${index === active ? ' is-active' : ''}`}
              data-step={index}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              key={challenge.tag}
            >
              <p className="cstep__num">Challenge {String(index + 1).padStart(2, '0')}</p>
              <h3 className="cstep__tag">{challenge.tag}</h3>

              <div className="cstep__block">
                <span className="cstep__label">Problem</span>
                <p>{challenge.problem}</p>
              </div>
              <div className="cstep__block">
                <span className="cstep__label">Approach</span>
                <p>{challenge.approach}</p>
              </div>
              <div className="cstep__block">
                <span className="cstep__label">Shipped</span>
                <p>{challenge.shipped}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {caseStudy.architecture ? (
        <section className="carch">
          <h3 className="carch__label">Final architecture</h3>
          <p className="carch__lead">{caseStudy.architecture.summary}</p>

          <ol className="carch__flow">
            {caseStudy.architecture.steps.map((step, index) => (
              <li className="carch__step" key={step}>
                <span className="carch__step-num">{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>

          {caseStudy.architecture.diagram ? (
            <figure className="carch__figure">
              <img
                src={caseStudy.architecture.diagram.src}
                alt={caseStudy.architecture.diagram.alt}
                loading="lazy"
              />
              <figcaption>New generative-AI architecture — ingestion, retrieval and serving.</figcaption>
            </figure>
          ) : null}
        </section>
      ) : null}

      <div className="cstudy__impact">
        <h3 className="yc-immersive__label">Impact</h3>
        <ul className="yc-immersive__bullets">
          {caseStudy.impact.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
