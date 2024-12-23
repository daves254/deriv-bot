import React, { KeyboardEvent } from 'react';
import parse from 'html-react-parser';
import Accordion from '@/components/shared_ui/accordion';
import Text from '@/components/shared_ui/text';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { TDescription } from '../tutorials.types';

type TFAQContent = {
    faq_list: TFAQList[];
    handleTabChange: (active_number: number) => void;
};

type TFAQList = {
    title: string;
    description: TDescription[];
    search_id?: string;
};

const FAQ = ({ type, content = '', src, imageclass, is_mobile }: TDescription) => {
    if (type === 'image') return <img src={src} className={imageclass} />;

    return (
        <Text
            as='p'
            size={is_mobile ? 'xs' : 's'}
            lineHeight={is_mobile ? 'xl' : 'xxl'}
            className='faq__description'
            weight='normal'
            key={content}
        >
            {parse(content)}
        </Text>
    );
};

const scrollToElement = (wrapper_element: HTMLElement, offset: number) => {
    if (wrapper_element) {
        wrapper_element.scrollTo({
            top: offset,
            behavior: 'smooth',
        });
    }
};

const FAQContent = ({ faq_list, handleTabChange }: TFAQContent) => {
    const { isDesktop } = useDevice();
    const { dashboard } = useStore();
    const { faq_title, setFaqTitle } = dashboard;

    const handleAccordionOpen = () => {
        faq_list.forEach(data => {
            if (data.search_id === faq_title) {
                document.querySelectorAll('.faq__title').forEach((data, index) => {
                    if (Number(faq_title.split('-')[1]) === index) {
                        data.click();
                        setFaqTitle('');
                        handleTabChange(DBOT_TABS.TUTORIAL);
                    }
                });
            }
        });
    };

    React.useEffect(() => {
        handleAccordionOpen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const faq_wrapper_element = React.useRef<HTMLDivElement>(null);
    const timer_id = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleAccordionClick = () => {
        // Scroll to the top of the open accordion item.
        // Need timer to first close the accordion item then scroll the new item to top.
        timer_id.current = setTimeout(() => {
            const open_accordion_element: HTMLElement | null | undefined =
                faq_wrapper_element.current?.querySelector('.dc-accordion__item--open');
            const previous_sibling_element = open_accordion_element?.previousElementSibling as HTMLElement;
            if (faq_wrapper_element.current && open_accordion_element) {
                const offset = previous_sibling_element ? previous_sibling_element.offsetTop - 80 : 0;
                const desktop_scroll_element = document.querySelector('.dc-tabs__content--tutorials') as HTMLElement;
                const mobile_scroll_element = document.querySelector('.tutorials-mobile__faq') as HTMLElement;
                const scroll_element = isDesktop ? desktop_scroll_element : mobile_scroll_element;
                scrollToElement(scroll_element, offset);
            }
            if (timer_id?.current) clearTimeout(timer_id.current);
        }, 5);
    };

    const handleKeyboardEvent = (e: KeyboardEvent) => {
        if (e.key === 'Enter') handleAccordionClick();
    };

    React.useEffect(() => {
        return () => {
            if (timer_id.current) clearTimeout(timer_id.current);
        };
    }, []);

    const getList = () => {
        return faq_list.map(({ title, description }: TFAQList) => ({
            header: (
                <Text
                    as='p'
                    lineHeight='xl'
                    className='faq__title'
                    weight='bold'
                    key={title}
                    size={isDesktop ? 's' : 'xs'}
                >
                    {title}
                </Text>
            ),
            content: description?.map((item, index) => (
                <FAQ {...item} is_mobile={!isDesktop} key={`faq-description-item-${item?.content}-${index}`} />
            )),
        }));
    };

    return React.useMemo(
        () => (
            <div data-testid='id-faq__wrapper'>
                <div className='faq__wrapper' ref={faq_wrapper_element}>
                    {faq_list?.length > 0 && (
                        <>
                            <Text
                                as='p'
                                lineHeight='xl'
                                className='faq__wrapper__header'
                                weight='bold'
                                size={isDesktop ? 's' : 'xs'}
                            >
                                <Localize i18n_default_text='FAQ' />
                            </Text>
                            <div
                                data-testid='id-accordion-test'
                                onClick={handleAccordionClick}
                                onKeyDown={handleKeyboardEvent}
                            >
                                <Accordion className='faq__wrapper__content' list={getList()} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [faq_list]
    );
};

export default FAQContent;
